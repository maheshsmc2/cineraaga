#!/usr/bin/env python3
"""Refresh frontend/navras/data/mood-extra.json — Mood page films beyond the lists.

Usage (from repo root):
    python3 scripts/build-mood-extra.py

Re-fetches title, year and poster from TMDb for every film already in the file,
which is what honours TMDb's six-month cache limit. Rasas are never touched.
Films TMDb no longer has, or that have since entered a ranked list or a review
(and are therefore covered by film-db.json), are removed and reported.

To add a film, append {"tmdb_id": N, "language": "hindi", "rasas": [...]} and
run this. Which rasas it carries is the editor's decision.
"""
import datetime
import json
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

NAVRAS_DIR = Path(__file__).resolve().parents[1] / "frontend" / "navras"
DATA_DIR = NAVRAS_DIR / "data"
EXTRA_PATH = DATA_DIR / "mood-extra.json"
RASAS = {"shringara", "hasya", "karuna", "veera", "bhayanaka",
         "adbhuta", "raudra", "shanta", "bibhatsa"}

API_KEY = re.search(
    r"TMDB_KEY:\s*'([^']+)'",
    (NAVRAS_DIR / "js" / "config.js").read_text(encoding="utf-8"),
).group(1)


def movie(tmdb_id: int):
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}"
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=25) as res:
                return json.load(res)
        except urllib.error.HTTPError as err:
            if err.code == 404:
                return None
            if err.code != 429 and err.code < 500:
                raise
        except (urllib.error.URLError, TimeoutError):
            pass
        time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"TMDb unreachable for film {tmdb_id}")


def dump(data: dict) -> str:
    """One film per line, so changes are readable in a diff."""
    head = {k: v for k, v in data.items() if k != "films"}
    text = json.dumps(head, ensure_ascii=False, indent=1)[:-2]
    rows = ",\n".join("  " + json.dumps(f, ensure_ascii=False) for f in data["films"])
    return f'{text},\n "films": [\n{rows}\n ]\n}}\n'


def main() -> int:
    data = json.loads(EXTRA_PATH.read_text(encoding="utf-8"))
    films = data["films"]

    ids = [f["tmdb_id"] for f in films]
    if len(ids) != len(set(ids)):
        sys.exit("A tmdb_id appears twice in mood-extra.json")
    for f in films:
        if not f.get("rasas") or set(f["rasas"]) - RASAS:
            sys.exit(f"Missing or unknown rasa for tmdb_id {f['tmdb_id']}")

    db = json.loads((DATA_DIR / "film-db.json").read_text(encoding="utf-8"))
    reviews = json.loads((DATA_DIR / "reviews.json").read_text(encoding="utf-8"))
    covered = {r.get("tmdb_id") for r in db.values()} | {r.get("tmdb_id") for r in reviews}

    with ThreadPoolExecutor(8) as pool:
        fetched = list(pool.map(movie, ids))

    kept = []
    for film, rec in zip(films, fetched):
        name = film.get("title", film["tmdb_id"])
        if film["tmdb_id"] in covered:
            print(f"removed (now in a list or review): {name}")
        elif not rec or not rec.get("poster_path") or not rec.get("release_date"):
            print(f"removed (no longer on TMDb, or no poster/date): {name}")
        else:
            kept.append({
                "tmdb_id": film["tmdb_id"], "title": rec["title"],
                "year": int(rec["release_date"][:4]), "language": film["language"],
                "poster_path": rec["poster_path"], "rasas": film["rasas"],
            })

    data["fetched_at"] = datetime.date.today().isoformat()
    data["films"] = kept
    EXTRA_PATH.write_text(dump(data), encoding="utf-8")
    print(f"{len(kept)} films written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
