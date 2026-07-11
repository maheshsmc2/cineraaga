"""Enrich films with TMDb metadata (posters, backdrops, overview).

Usage:  python -m app.services.tmdb_sync            # all films missing a poster
        python -m app.services.tmdb_sync <slug>     # one film

TMDb is the commodity backbone only. Nothing proprietary flows FROM TMDb:
scores, rasas and verdicts always come from Mahe.
"""
import sys

import httpx

from ..config import settings
from ..db import SessionLocal
from ..models import Film

LANG_CODES = {"hindi": "hi", "tamil": "ta", "telugu": "te",
              "malayalam": "ml", "punjabi": "pa"}


def enrich(client: httpx.Client, film: Film) -> bool:
    if film.tmdb_id:
        r = client.get(f"{settings.tmdb_base}/movie/{film.tmdb_id}",
                       params={"api_key": settings.tmdb_api_key})
        if r.status_code != 200:
            return False
        hit = r.json()
    else:
        params = {"api_key": settings.tmdb_api_key, "query": film.title,
                  "include_adult": "false"}
        if film.year:
            params["year"] = film.year
        r = client.get(f"{settings.tmdb_base}/search/movie", params=params)
        results = r.json().get("results", []) if r.status_code == 200 else []
        code = LANG_CODES.get(film.language or "")
        if code:
            results = [x for x in results if x.get("original_language") == code] or results
        if not results:
            return False
        hit = results[0]
        film.tmdb_id = hit["id"]
    film.poster_path = hit.get("poster_path") or film.poster_path
    film.backdrop_path = hit.get("backdrop_path") or film.backdrop_path
    film.overview = hit.get("overview") or film.overview
    return True


def run(slug: str | None = None) -> None:
    if not settings.tmdb_api_key:
        sys.exit("TMDB_API_KEY not set (see .env.example)")
    db = SessionLocal()
    try:
        q = db.query(Film)
        q = q.filter_by(slug=slug) if slug else q.filter(Film.poster_path.is_(None))
        films = q.all()
        ok = fail = 0
        with httpx.Client(timeout=15) as client:
            for f in films:
                if enrich(client, f):
                    ok += 1
                else:
                    fail += 1
                    print(f"  no match: {f.title} ({f.year}) — set tmdb_id manually")
        db.commit()
        print(f"Enriched {ok} films, {fail} unmatched")
    finally:
        db.close()


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else None)
