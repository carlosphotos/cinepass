#!/usr/bin/env python3
import json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

API_KEY=os.environ.get("MOVIE_NIGHT_API_KEY","").strip()
if not API_KEY:
    print("ERROR: MOVIE_NIGHT_API_KEY no está definido.",file=sys.stderr);sys.exit(1)

TITLE="Do the Right Thing"; YEAR=1989; BASE_URL="https://api.movieofthenight.com/v4"
COUNTRIES={"MX":"es","US":"en","FR":"fr","ES":"es","CA":"en"}

def norm(v):return str(v or "").strip().casefold()
def extract_results(obj):
    if isinstance(obj,list):return obj
    if isinstance(obj,dict):
        for key in ("shows","results","items"):
            if isinstance(obj.get(key),list):return obj[key]
        if obj.get("title"):return [obj]
    return []
def first_url(value):
    if isinstance(value,str):return value
    if isinstance(value,dict):
        for key in ("w360","360","w480","480","w240","240","w600","600","w720","720"):
            if isinstance(value.get(key),str):return value[key]
        for v in value.values():
            if isinstance(v,str) and v.startswith("http"):return v
    return None
def poster_for(show):
    images=show.get("imageSet") or show.get("images") or {}
    if isinstance(images,dict):
        for key in ("verticalPoster","verticalPosterUrl","poster","posterUrl"):
            u=first_url(images.get(key))
            if u:return u
    for key in ("verticalPoster","poster","posterUrl","image"):
        u=first_url(show.get(key))
        if u:return u
    return None
def compact_options(show,country):
    streaming=show.get("streamingOptions") or {}
    opts=(streaming.get(country.lower()) or streaming.get(country.upper()) or []) if isinstance(streaming,dict) else streaming if isinstance(streaming,list) else []
    out=[]
    for opt in opts:
        if not isinstance(opt,dict):continue
        service=opt.get("service") or {}
        if isinstance(service,str): name=sid=service;logo=None
        else:
            name=service.get("name") or service.get("id");sid=service.get("id");logo=None
            image_set=service.get("imageSet") or service.get("images") or {}
            if isinstance(image_set,dict):
                for lk in ("lightThemeImage","darkThemeImage","whiteImage","logo"):
                    logo=first_url(image_set.get(lk))
                    if logo:break
        price=opt.get("price")
        if isinstance(price,dict):amount=price.get("amount") or price.get("value");currency=price.get("currency")
        else:amount=price;currency=opt.get("currency")
        out.append({"service":name,"serviceId":sid,"type":opt.get("type"),"link":opt.get("link") or opt.get("url"),"price":amount,"currency":currency,"quality":opt.get("quality"),"serviceLogo":logo})
    return out

def fetch(country,language):
    params={"title":TITLE,"country":country.lower(),"show_type":"movie","output_language":language}
    req=urllib.request.Request(f"{BASE_URL}/shows/search/title?{urllib.parse.urlencode(params)}",headers={"X-API-Key":API_KEY,"Accept":"application/json","User-Agent":"ReelStub/0.2 (GitHub Actions test)"})
    with urllib.request.urlopen(req,timeout=30) as response: payload=json.loads(response.read().decode("utf-8"))
    results=extract_results(payload)
    if not results:raise RuntimeError(f"Sin resultados para {country}")
    wanted=norm(TITLE)
    show=next((r for r in results if int(r.get("releaseYear") or 0)==YEAR and (norm(r.get("title"))==wanted or norm(r.get("originalTitle"))==wanted)),None)
    if show is None:show=next((r for r in results if int(r.get("releaseYear") or 0)==YEAR),results[0])
    return show

countries={};canonical=None
for country,language in COUNTRIES.items():
    try:
        show=fetch(country,language);canonical=canonical or show
        countries[country]={"localizedTitle":show.get("title"),"overview":show.get("overview"),"poster":poster_for(show),"streamingOptions":compact_options(show,country)}
        print(f"OK {country}: {show.get('title')} · {len(countries[country]['streamingOptions'])} opciones")
    except Exception as exc:
        print(f"AVISO {country}: {exc}",file=sys.stderr);countries[country]={"localizedTitle":None,"overview":None,"poster":None,"streamingOptions":[]}
if not canonical:sys.exit(2)
output={"generatedAt":datetime.now(timezone.utc).isoformat(),"defaultCountry":"MX","availableCountries":list(COUNTRIES),"query":{"title":TITLE,"year":YEAR},"movie":{"id":canonical.get("id"),"imdbId":canonical.get("imdbId"),"tmdbId":canonical.get("tmdbId"),"title":TITLE,"originalTitle":canonical.get("originalTitle") or TITLE,"releaseYear":canonical.get("releaseYear")},"countries":countries,"attribution":"Streaming availability data provided by Streaming Availability API by Movie of the Night."}
path=Path("data/streaming-test.json");path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"Archivo: {path}")
