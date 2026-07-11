"""Export the database to static JSON for the frontend.

This is the launch-mode publishing pipeline:

    python -m app.services.export

writes to frontend/data/:
    mood/{rasa}.json      films tagged with each rasa (human tags only)
    lists/index.json      list metadata for the lists page
    lists/{slug}.json     full list with ranked, blurbed entries
    films/index.json      lightweight film index (search/browse)
    films/{slug}.json     full film detail

Commit the output and push — Vercel serves it. No live servers at launch.
"""
import json
from pathlib import Path

from sqlalchemy.orm import Session, selectinload

from ..config import settings
from ..db import SessionLocal
from ..models import RASAS, CuratedList, Film

BASE_DIR = Path(__file__).resolve().parents[2]


def film_card(f: Film) -> dict:
    """Compact representation used in grids and lists."""
    return {
        "slug": f.slug,
        "title": f.title,
        "year": f.year,
        "language": f.language,
        "poster_path": f.poster_path,
        "navras_score": f.navras_score,
        "score_status": f.score_status,
        "color": f.color,
        "verdict": f.verdict,
        "era": f.era,
        "rasas": f.rasas,
        "ott": f.ott or [],
    }


def film_detail(f: Film) -> dict:
    d = film_card(f)
    d.update({
        "tmdb_id": f.tmdb_id,
        "backdrop_path": f.backdrop_path,
        "overview": f.overview,
        "ott_checked_at": f.ott_checked_at.isoformat() if f.ott_checked_at else None,
        "review_slug": f.review.slug if f.review else None,
    })
    return d


def write(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=1))


def export_all(db: Session, out_dir: Path | None = None) -> dict:
    out = out_dir or (BASE_DIR / settings.export_dir).resolve()
    films = (
        db.query(Film)
        .options(selectinload(Film.rasa_tags), selectinload(Film.review))
        .all()
    )

    # mood/{rasa}.json
    for rasa in RASAS:
        tagged = [f for f in films if rasa in f.rasas]
        tagged.sort(key=lambda f: (-(f.navras_score or 0), f.title))
        write(out / "mood" / f"{rasa}.json",
              {"rasa": rasa, "count": len(tagged),
               "films": [film_card(f) for f in tagged]})

    # films/
    write(out / "films" / "index.json", [film_card(f) for f in films])
    for f in films:
        write(out / "films" / f"{f.slug}.json", film_detail(f))

    # lists/
    lists = db.query(CuratedList).options(
        selectinload(CuratedList.entries)).all()
    index = []
    for lst in lists:
        meta = {
            "slug": lst.slug, "title": lst.title,
            "description": lst.description, "category": lst.category,
            "count": len(lst.entries),
            "updated_at": lst.updated_at.isoformat() if lst.updated_at else None,
        }
        index.append(meta)
        write(out / "lists" / f"{lst.slug}.json", {
            **meta, "intro": lst.intro,
            "entries": [
                {"rank": e.rank, "blurb": e.blurb, "film": film_card(e.film)}
                for e in lst.entries
            ],
        })
    write(out / "lists" / "index.json", index)

    return {"films": len(films), "lists": len(lists), "out": str(out)}


def run() -> None:
    db = SessionLocal()
    try:
        stats = export_all(db)
        print(f"Exported {stats['films']} films, {stats['lists']} lists → {stats['out']}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
