#!/usr/bin/env python3
"""Build ReelStub's static streaming catalog without exposing the API key.

Each title is first identified through title search (which requires a country),
then fetched again by IMDb/API id without a country parameter. That second
request returns global streamingOptions for all supported regions. We request
Spanish localization because Mexico is ReelStub's default region; the site's
interface itself remains available in ES/EN/FR.
"""
import difflib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

API_KEY = os.environ.get("MOVIE_NIGHT_API_KEY", "").strip()
if not API_KEY:
    print("ERROR: MOVIE_NIGHT_API_KEY no está definido.", file=sys.stderr)
    sys.exit(1)

BASE_URL = "https://api.movieofthenight.com/v4"
COUNTRIES = ["MX", "US", "GB", "FR", "ES", "CA"]
# The title-search endpoint requires a country. Try broad catalogs first and
# stop as soon as we get a usable match. The returned Show object still uses
# the normal streamingOptions map keyed by country.
SEARCH_COUNTRIES = ["us", "gb", "mx", "fr", "es", "ca"]
OUTPUT_LANGUAGE = "es"
FILMS_FILE = Path("films.js")
OUTPUT_FILE = Path("data/streaming-catalog.json")


def load_films():
    text = FILMS_FILE.read_text(encoding="utf-8")
    match = re.search(r"=\s*(\[.*\])\s*;\s*$", text, re.S)
    if not match:
        raise RuntimeError("No pude leer la lista de films.js")
    return json.loads(match.group(1))


def norm(value):
    value = str(value or "").casefold()
    value = re.sub(r"[^\w]+", " ", value, flags=re.UNICODE)
    return " ".join(value.split())


def extract_results(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("shows", "results", "items"):
            if isinstance(payload.get(key), list):
                return payload[key]
        if payload.get("title"):
            return [payload]
    return []


def first_url(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        for key in ("w480", "480", "w360", "360", "w600", "600", "w240", "240", "w720", "720"):
            if isinstance(value.get(key), str):
                return value[key]
        for v in value.values():
            if isinstance(v, str) and v.startswith("http"):
                return v
    return None


def poster_for(show):
    images = show.get("imageSet") or show.get("images") or {}
    if isinstance(images, dict):
        for key in ("verticalPoster", "verticalPosterUrl", "poster", "posterUrl"):
            url = first_url(images.get(key))
            if url:
                return url
    for key in ("verticalPoster", "poster", "posterUrl", "image"):
        url = first_url(show.get(key))
        if url:
            return url
    return None


def service_logo(service):
    if not isinstance(service, dict):
        return None
    image_set = service.get("imageSet") or service.get("images") or {}
    if isinstance(image_set, dict):
        for key in ("lightThemeImage", "darkThemeImage", "whiteImage", "logo"):
            url = first_url(image_set.get(key))
            if url:
                return url
    return None


def compact_options(show, country):
    streaming = show.get("streamingOptions") or {}
    if isinstance(streaming, dict):
        options = streaming.get(country.lower()) or streaming.get(country.upper()) or []
    elif isinstance(streaming, list):
        options = streaming
    else:
        options = []
    out = []
    for opt in options:
        if not isinstance(opt, dict):
            continue
        service = opt.get("service") or {}
        if isinstance(service, str):
            name = service
            sid = service
            logo = None
        else:
            name = service.get("name") or service.get("id") or "Servicio"
            sid = service.get("id") or name
            logo = service_logo(service)
        price = opt.get("price")
        if isinstance(price, dict):
            amount = price.get("amount") if price.get("amount") is not None else price.get("value")
            currency = price.get("currency") or opt.get("currency")
        else:
            amount = price
            currency = opt.get("currency")
        out.append({
            "service": name,
            "serviceId": sid,
            "type": opt.get("type"),
            "link": opt.get("link") or opt.get("url"),
            "price": amount,
            "currency": currency,
            "quality": opt.get("quality"),
            "serviceLogo": logo,
        })
    return out


def score_result(film, result):
    wanted = norm(film["title"])
    title = norm(result.get("title"))
    original = norm(result.get("originalTitle"))
    score = max(difflib.SequenceMatcher(None, wanted, title).ratio(), difflib.SequenceMatcher(None, wanted, original).ratio()) * 100
    if wanted in (title, original):
        score += 100
    try:
        result_year = int(result.get("releaseYear") or 0)
        year_gap = abs(int(film["year"]) - result_year)
        if year_gap == 0:
            score += 55
        elif year_gap <= 1:
            score += 20
    except Exception:
        pass
    if result.get("showType") == "movie":
        score += 5
    return score


def request_json(url, attempts=4):
    headers = {
        "X-API-Key": API_KEY,
        "Accept": "application/json",
        "User-Agent": "ReelStub/0.5 (GitHub Actions global catalog builder)",
    }
    last = None
    for attempt in range(attempts):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=35) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in (429, 500, 502, 503, 504):
                raise
        except Exception as exc:
            last = exc
        time.sleep(1.5 * (2 ** attempt))
    raise last or RuntimeError("Error de red")


def fetch_show(film):
    """Find the title, then refetch the matched show with GLOBAL availability.

    Search-by-title requires a country and is only used to identify the right
    show. Once we have an API/IMDb id, GET /shows/{id} without `country`
    returns streamingOptions for every supported country where it is available.
    """
    last_error = None
    matched = None

    # 1) Identify the correct title. Search endpoint requires a country.
    for search_country in SEARCH_COUNTRIES:
        params = {
            "title": film["title"],
            "country": search_country,
            "output_language": OUTPUT_LANGUAGE,
        }
        url = f"{BASE_URL}/shows/search/title?{urllib.parse.urlencode(params)}"
        try:
            payload = request_json(url)
        except urllib.error.HTTPError as exc:
            last_error = exc
            if exc.code == 400:
                raise
            continue
        except Exception as exc:
            last_error = exc
            continue

        results = extract_results(payload)
        if not results:
            continue
        best = max(results, key=lambda r: score_result(film, r))
        score = score_result(film, best)
        if score >= 82:
            matched = best
            break
        last_error = RuntimeError(
            f"coincidencia dudosa en {search_country.upper()}: "
            f"{best.get('title')} ({best.get('releaseYear')})"
        )

    if not matched:
        if last_error:
            raise last_error
        raise RuntimeError("sin resultados en los países de búsqueda")

    # 2) Refetch WITHOUT country to obtain global streamingOptions.
    # Prefer IMDb because it is unambiguous and URL-safe; API id is fallback.
    show_id = matched.get("imdbId") or matched.get("id")
    if not show_id:
        # Extremely rare fallback: keep the search response rather than losing
        # poster/metadata entirely, even though options may be country-limited.
        return matched

    params = {"output_language": OUTPUT_LANGUAGE}
    url = f"{BASE_URL}/shows/{urllib.parse.quote(str(show_id), safe='')}?{urllib.parse.urlencode(params)}"
    try:
        global_show = request_json(url)
        if isinstance(global_show, dict) and global_show.get("title"):
            return global_show
    except Exception as exc:
        # Preserve useful metadata if global refetch transiently fails.
        print(
            f"AVISO global {film['title']}: {exc} · uso respuesta de búsqueda",
            file=sys.stderr,
        )
    return matched

def load_existing():
    if not OUTPUT_FILE.exists():
        return {}
    try:
        payload = json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
        return payload.get("films") or {}
    except Exception:
        return {}


def main():
    films = load_films()
    old = load_existing()
    catalog = {}
    errors = []
    for index, film in enumerate(films, 1):
        try:
            show = fetch_show(film)
            localized = show.get("title") or ""
            if norm(localized) == norm(film["title"]):
                localized = None
            countries = {code: {"streamingOptions": compact_options(show, code)} for code in COUNTRIES}
            catalog[film["id"]] = {
                "id": film["id"],
                "rank": film["rank"],
                "title": film["title"],
                "year": film["year"],
                "director": film["director"],
                "apiId": show.get("id"),
                "imdbId": show.get("imdbId"),
                "tmdbId": show.get("tmdbId"),
                "apiReleaseYear": show.get("releaseYear"),
                "localizedTitle": localized,
                "localizationLanguage": OUTPUT_LANGUAGE,
                "poster": poster_for(show),
                "countries": countries,
                "updatedAt": datetime.now(timezone.utc).isoformat(),
            }
            total_opts = sum(len(v["streamingOptions"]) for v in countries.values())
            print(f"[{index:03}/{len(films)}] OK {film['title']} · {total_opts} opciones")
        except Exception as exc:
            errors.append({"id": film["id"], "title": film["title"], "error": str(exc)})
            if film["id"] in old:
                catalog[film["id"]] = old[film["id"]]
                print(f"[{index:03}/{len(films)}] AVISO {film['title']}: {exc} · conservo datos anteriores", file=sys.stderr)
            else:
                print(f"[{index:03}/{len(films)}] AVISO {film['title']}: {exc}", file=sys.stderr)
        time.sleep(0.12)

    country_stats = {}
    for code in COUNTRIES:
        with_any = 0
        option_count = 0
        for item in catalog.values():
            options = (((item.get("countries") or {}).get(code) or {}).get("streamingOptions") or [])
            if options:
                with_any += 1
                option_count += len(options)
        country_stats[code] = {"filmsWithOptions": with_any, "optionCount": option_count}

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "defaultCountry": "MX",
        "availableCountries": COUNTRIES,
        "localizationLanguage": OUTPUT_LANGUAGE,
        "filmCount": len(catalog),
        "sourceFilmCount": len(films),
        "countryStats": country_stats,
        "films": catalog,
        "errors": errors,
        "attribution": "Streaming availability data provided by Streaming Availability API by Movie of the Night.",
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nCatálogo: {len(catalog)}/{len(films)} · errores nuevos: {len(errors)}")
    for code, stat in country_stats.items():
        print(f"  {code}: {stat['filmsWithOptions']}/{len(catalog)} películas con opciones · {stat['optionCount']} opciones")

    # Do not let GitHub Actions show a misleading green run if the API request
    # shape breaks again. A handful of unmatched classics is acceptable; a
    # mostly empty catalog is not.
    minimum_ok = max(50, int(len(films) * 0.50))
    if len(catalog) < minimum_ok:
        print(
            f"ERROR: solo se construyeron {len(catalog)} de {len(films)} títulos; "
            "no guardaré este catálogo como una actualización válida.",
            file=sys.stderr,
        )
        sys.exit(4)
    print(f"Archivo: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
