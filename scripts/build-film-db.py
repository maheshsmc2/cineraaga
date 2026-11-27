#!/usr/bin/env python3
"""Build frontend/navras/data/film-db.json — our own record of every film we cover.

Usage (from repo root):
    python3 scripts/build-film-db.py              # look up films not yet stored
    python3 scripts/build-film-db.py --refresh    # also re-fetch stored films

Why: list entries mostly carry only title + year, so every visitor's browser
searched TMDb on each page load and took the first result — which is how wrong
posters appeared. This resolves each film once, keeps the answer, and sends
anything doubtful to a human instead of guessing.

A film is matched automatically only when exactly one TMDb record has
  - the same title (TMDb title, original title or a listed alternative title),
  - the same original language as the list entry,
  - a release year within one of the entry's (an exact year wins over ±1), and
  - a feature-length runtime.
Anything else is written to docs/FILM_MATCHES_TO_REVIEW.md. Settle those in
scripts/film-overrides.json ("title|year|language": tmdb_id, or null for "no
TMDb record") and re-run.

The title, year and language stored are the list editor's own; TMDb's values
are kept alongside, never written over them. Each record carries fetched_at so
the TMDb cache limit can be honoured with --refresh.
"""
import datetime
import difflib
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
NAVRAS_DIR = REPO_ROOT / "frontend" / "navras"
LISTS_DIR = NAVRAS_DIR / "data" / "lists"
DB_PATH = NAVRAS_DIR / "data" / "film-db.json"
OVERRIDES_PATH = REPO_ROOT / "scripts" / "film-overrides.json"
REVIEW_PATH = REPO_ROOT / "docs" / "FILM_MATCHES_TO_REVIEW.md"

LANG_CODES = {
    "hindi": "hi", "tamil": "ta", "telugu": "te", "malayalam": "ml",
    "kannada": "kn", "marathi": "mr", "bengali": "bn", "assamese": "as",
    "punjabi": "pa", "gujarati": "gu", "english": "en",
}
MIN_FEATURE_MINUTES = 60

API_KEY = re.search(
    r"TMDB_KEY:\s*'([^']+)'",
    (NAVRAS_DIR / "js" / "config.js").read_text(encoding="utf-8"),
).group(1)


def api(path: str, **params):
    params["api_key"] = API_KEY
    url = f"https://api.themoviedb.org/3{path}?{urllib.parse.urlencode(params)}"
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
    raise RuntimeError(f"TMDb unreachable for {path}")


def norm(title: str) -> str:
    """Comparison form: no accents, punctuation, spacing or case."""
    s = unicodedata.normalize("NFKD", title or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower().replace("&", "and")
    return "".join(c for c in s if c.isalnum())


def query_variants(title: str) -> list[str]:
    """'Pushpaka Vimana (Pushpak)' is searched and compared as each name."""
    out = [title]
    m = re.match(r"^(.*?)\s*\((.*?)\)\s*$", title)
    if m:
        out += [m.group(1), m.group(2)]
    return [v for v in out if v]


def details(movie_id: int):
    return api(f"/movie/{movie_id}", append_to_response="credits,alternative_titles")


def year_of(movie: dict):
    date = movie.get("release_date") or ""
    return int(date[:4]) if date[:4].isdigit() else None


def titles_of(movie: dict) -> set[str]:
    alts = (movie.get("alternative_titles") or {}).get("titles", [])
    names = [movie.get("title"), movie.get("original_title")]
    names += [a.get("title") for a in alts]
    return {norm(n) for n in names if n and norm(n)}


def record(film: dict, movie: dict | None, how: str) -> dict:
    base = {
        "title": film["title"], "year": film["year"], "language": film["language"],
        "tmdb_id": None, "match": how,
        "fetched_at": datetime.date.today().isoformat(),
    }
    if movie:
        crew = (movie.get("credits") or {}).get("crew", [])
        base.update({
            "tmdb_id": movie["id"],
            "tmdb_title": movie.get("title"),
            "release_date": movie.get("release_date") or None,
            "poster_path": movie.get("poster_path"),
            "backdrop_path": movie.get("backdrop_path"),
            "runtime": movie.get("runtime") or None,
            "director": [c["name"] for c in crew if c.get("job") == "Director"],
            "cast": [c["name"] for c in (movie.get("credits") or {}).get("cast", [])[:6]],
            "genres": [g["name"] for g in movie.get("genres", [])],
        })
    return base


def candidate_ids(film: dict) -> list[int]:
    found: dict[int, None] = {}
    for query in query_variants(film["title"]):
        for extra in ({"primary_release_year": film["year"]}, {}):
            data = api("/search/movie", query=query, include_adult="false", **extra)
            for m in (data or {}).get("results", [])[:20]:
                lang_ok = m.get("original_language") == LANG_CODES.get(film["language"])
                y = year_of(m)
                year_ok = y is not None and abs(y - film["year"]) <= 2
                if lang_ok or year_ok:
                    found[m["id"]] = None
    return list(found)


def resolve(film: dict):
    """-> (record, None) when settled, (None, review_item) when not."""
    if film.get("tmdb_id"):
        movie = details(film["tmdb_id"])
        if not movie:
            return None, {"film": film, "why": f"pinned id {film['tmdb_id']} not found", "options": []}
        y = year_of(movie)
        if movie.get("original_language") != LANG_CODES.get(film["language"]) \
                or y is None or abs(y - film["year"]) > 1:
            return None, {"film": film, "why": "pinned id disagrees on year or language",
                          "options": [movie]}
        return record(film, movie, "pinned"), None

    movies = [m for m in (details(i) for i in candidate_ids(film)) if m]
    wanted = {norm(v) for v in query_variants(film["title"])}
    code = LANG_CODES.get(film["language"])

    strict = [
        m for m in movies
        if m.get("original_language") == code
        and year_of(m) is not None and abs(year_of(m) - film["year"]) <= 1
        and wanted & titles_of(m)
        and (m.get("runtime") or 0) >= MIN_FEATURE_MINUTES
    ]
    exact = [m for m in strict if year_of(m) == film["year"]]
    pool = exact or strict
    if len(pool) == 1:
        return record(film, pool[0], "auto"), None

    def closeness(m):
        title = max((difflib.SequenceMatcher(None, w, t).ratio()
                     for w in wanted for t in titles_of(m)), default=0)
        y = year_of(m)
        return (m.get("original_language") == code,
                round(title, 2),
                -(abs(y - film["year"]) if y else 99),
                m.get("vote_count") or 0)

    ranked = sorted(movies, key=closeness, reverse=True)[:4]
    if len(pool) > 1:
        why = f"{len(pool)} records match equally"
        ranked = pool[:4]
    elif ranked:
        why = "no record matches title, language, year and length together"
    else:
        why = "TMDb search returned nothing usable"
    return None, {"film": film, "why": why, "options": ranked}


def collect_films() -> list[dict]:
    films: dict[str, dict] = {}
    for path in sorted(LISTS_DIR.glob("*.json")):
        if path.name == "index.json":
            continue
        for entry in json.loads(path.read_text(encoding="utf-8")).get("entries", []):
            f = entry["film"]
            key = f"{f['title']}|{f['year']}|{f['language']}"
            item = films.setdefault(key, {
                "key": key, "title": f["title"], "year": f["year"],
                "language": f["language"], "tmdb_id": None, "lists": [],
            })
            item["tmdb_id"] = item["tmdb_id"] or f.get("tmdb_id")
            item["lists"].append(f"{path.stem} #{entry.get('rank')}")
    reviews = json.loads((LISTS_DIR.parent / "reviews.json").read_text(encoding="utf-8"))
    for r in reviews:
        language = r["language"].lower()
        key = f"{r['title']}|{r['year']}|{language}"
        item = films.setdefault(key, {
            "key": key, "title": r["title"], "year": r["year"],
            "language": language, "tmdb_id": None, "lists": [],
        })
        item["tmdb_id"] = item["tmdb_id"] or r.get("tmdb_id")
        item["lists"].append(f"review {r['slug']}")
    return list(films.values())


def describe(m: dict) -> str:
    crew = (m.get("credits") or {}).get("crew", [])
    directors = ", ".join(c["name"] for c in crew if c.get("job") == "Director") or "director not listed"
    runtime = f"{m['runtime']} min" if m.get("runtime") else "runtime unknown"
    return (f"[{m['id']}](https://www.themoviedb.org/movie/{m['id']}) — {m.get('title')} "
            f"({year_of(m) or '?'}, {m.get('original_language')}) · {directors} · {runtime}"
            f"{'' if m.get('poster_path') else ' · no poster'}")


def write_review(items: list[dict]) -> None:
    if not items:
        REVIEW_PATH.unlink(missing_ok=True)
        return
    lines = ["# Films that need a human decision", "",
             f"{len(items)} films could not be matched with certainty. For each, put the",
             "right id in `scripts/film-overrides.json` (or `null` if none is right),",
             "then re-run `python3 scripts/build-film-db.py`.", ""]
    for n, item in enumerate(items, 1):
        f = item["film"]
        lines += [f"## {n}. {f['title']} ({f['year']}, {f['language']})", "",
                  f"- Key: `{f['key']}`",
                  f"- In: {', '.join(f['lists'])}",
                  f"- Why: {item['why']}"]
        lines += [f"  - {describe(m)}" for m in item["options"]]
        lines.append("")
    REVIEW_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    refresh = "--refresh" in sys.argv
    films = collect_films()
    old = json.loads(DB_PATH.read_text(encoding="utf-8")) if DB_PATH.exists() else {}
    overrides = json.loads(OVERRIDES_PATH.read_text(encoding="utf-8")) if OVERRIDES_PATH.exists() else {}

    unknown = set(overrides) - {f["key"] for f in films}
    if unknown:
        sys.exit(f"overrides name films that are in no list: {sorted(unknown)}")

    def handle(film):
        key = film["key"]
        stored = old.get(key)
        if key in overrides:
            chosen = overrides[key]
            if chosen is None:
                return key, record(film, None, "no-record"), None
            if stored and stored.get("tmdb_id") == chosen and not refresh:
                return key, stored, None
            movie = details(chosen)
            if not movie:
                sys.exit(f"override for {key}: TMDb id {chosen} not found")
            return key, record(film, movie, "confirmed"), None
        if stored and film["tmdb_id"] and stored.get("tmdb_id") != film["tmdb_id"]:
            stored = None  # the list entry now pins a different record
        if stored and not refresh:
            return key, stored, None
        if stored and stored.get("tmdb_id"):
            movie = details(stored["tmdb_id"])
            if movie:
                return key, record(film, movie, stored["match"]), None
        rec, review = resolve(film)
        return key, rec, review

    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(handle, films))

    db = {key: rec for key, rec, _ in results if rec}
    review = [item for _, _, item in results if item]
    DB_PATH.write_text(json.dumps(dict(sorted(db.items())), indent=1, ensure_ascii=False) + "\n",
                       encoding="utf-8")
    write_review(review)

    by_match: dict[str, int] = {}
    for rec in db.values():
        by_match[rec["match"]] = by_match.get(rec["match"], 0) + 1
    print(f"{len(films)} films | stored {len(db)} {by_match} | needing review {len(review)}")


if __name__ == "__main__":
    main()
