#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API_KEY = os.environ.get("MOVIE_NIGHT_API_KEY", "").strip()
if not API_KEY:
    print("ERROR: MOVIE_NIGHT_API_KEY no está definido.", file=sys.stderr)
    sys.exit(1)

TITLE = "Do the Right Thing"
YEAR = 1989
COUNTRY = "mx"
BASE_URL = "https://api.movieofthenight.com/v4"

params = {
    "title": TITLE,
    "country": COUNTRY,
    "show_type": "movie",
    "output_language": "es",
}
url = f"{BASE_URL}/shows/search/title?{urllib.parse.urlencode(params)}"
req = urllib.request.Request(
    url,
    headers={
        "X-API-Key": API_KEY,
        "Accept": "application/json",
        "User-Agent": "ReelStub/0.1 (GitHub Actions test)",
    },
)

try:
    with urllib.request.urlopen(req, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
except Exception as exc:
    print(f"ERROR consultando Streaming Availability API: {exc}", file=sys.stderr)
    sys.exit(2)

# La API puede devolver una lista directamente o envolverla en un campo.
def extract_results(obj):
    if isinstance(obj, list):
        return obj
    if isinstance(obj, dict):
        for key in ("shows", "results", "items"):
            if isinstance(obj.get(key), list):
                return obj[key]
        # En caso de que el endpoint devuelva un único show.
        if obj.get("title"):
            return [obj]
    return []

results = extract_results(payload)
if not results:
    print("ERROR: la API respondió, pero no encontré resultados de películas.", file=sys.stderr)
    print(json.dumps(payload, ensure_ascii=False, indent=2)[:4000], file=sys.stderr)
    sys.exit(3)

# Elegir primero coincidencia exacta de título + año; luego título exacto; finalmente el primer resultado.
def norm(value):
    return str(value or "").strip().casefold()

wanted = norm(TITLE)
show = next(
    (r for r in results if norm(r.get("title")) == wanted and int(r.get("releaseYear") or 0) == YEAR),
    None,
)
if show is None:
    show = next((r for r in results if norm(r.get("title")) == wanted), None)
if show is None:
    show = results[0]

# Elegir un póster vertical de resolución intermedia si está disponible.
def first_url(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        # La API suele ofrecer varios tamaños. Priorizamos ~360/480 para la web.
        for key in ("w360", "360", "w480", "480", "w240", "240", "w600", "600", "w720", "720"):
            v = value.get(key)
            if isinstance(v, str):
                return v
        for v in value.values():
            if isinstance(v, str) and v.startswith("http"):
                return v
    return None

images = show.get("imageSet") or show.get("images") or {}
poster = None
if isinstance(images, dict):
    for key in ("verticalPoster", "verticalPosterUrl", "poster", "posterUrl"):
        if key in images:
            poster = first_url(images[key])
            if poster:
                break
if not poster:
    for key in ("verticalPoster", "poster", "posterUrl", "image"):
        poster = first_url(show.get(key))
        if poster:
            break

streaming = show.get("streamingOptions") or {}
mx_options = []
if isinstance(streaming, dict):
    mx_options = streaming.get(COUNTRY) or streaming.get(COUNTRY.upper()) or []
elif isinstance(streaming, list):
    mx_options = streaming

# Convertir cada opción a un formato pequeño y estable para ReelStub.
options = []
for opt in mx_options if isinstance(mx_options, list) else []:
    if not isinstance(opt, dict):
        continue
    service = opt.get("service") or {}
    if isinstance(service, str):
        service_name = service
        service_id = service
        service_logo = None
    else:
        service_name = service.get("name") or service.get("id")
        service_id = service.get("id")
        logo_set = service.get("imageSet") or service.get("images") or {}
        service_logo = None
        if isinstance(logo_set, dict):
            for lk in ("lightThemeImage", "darkThemeImage", "whiteImage", "logo"):
                service_logo = first_url(logo_set.get(lk))
                if service_logo:
                    break

    price = opt.get("price")
    if isinstance(price, dict):
        price_value = price.get("amount") or price.get("value")
        currency = price.get("currency")
    else:
        price_value = price
        currency = opt.get("currency")

    options.append({
        "service": service_name,
        "serviceId": service_id,
        "type": opt.get("type"),
        "link": opt.get("link") or opt.get("url"),
        "price": price_value,
        "currency": currency,
        "quality": opt.get("quality"),
        "serviceLogo": service_logo,
    })

output = {
    "generatedAt": datetime.now(timezone.utc).isoformat(),
    "country": COUNTRY.upper(),
    "query": {"title": TITLE, "year": YEAR},
    "movie": {
        "id": show.get("id"),
        "imdbId": show.get("imdbId"),
        "tmdbId": show.get("tmdbId"),
        "title": show.get("title"),
        "originalTitle": show.get("originalTitle"),
        "releaseYear": show.get("releaseYear"),
        "overview": show.get("overview"),
        "poster": poster,
        "streamingOptions": options,
    },
    "attribution": "Streaming availability data provided by Streaming Availability API by Movie of the Night.",
}

out_path = Path("data/streaming-test.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

print(f"OK: {output['movie']['title']} ({output['movie']['releaseYear']})")
print(f"Póster: {'sí' if poster else 'no'}")
print(f"Opciones MX: {len(options)}")
print(f"Archivo: {out_path}")
