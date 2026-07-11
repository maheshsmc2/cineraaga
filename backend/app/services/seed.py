"""Load seed data (extracted from the v49 prototype) into the database.

Usage:  python -m app.services.seed
Idempotent: films are matched by slug; existing rows are updated, not duplicated.
"""
import json
from pathlib import Path

from slugify import slugify
from sqlalchemy.orm import Session

from ..db import Base, SessionLocal, engine
from ..models import CuratedList, Film, ListEntry, RasaTag

SEED_DIR = Path(__file__).resolve().parents[2] / "data" / "seeds"


def film_slug(title: str, year: int | None) -> str:
    return slugify(f"{title}-{year}" if year else title)


def upsert_film(db: Session, *, title: str, year: int | None = None,
                language: str | None = None, score: int | None = None,
                verdict: str | None = None, era: str | None = None,
                ott: list | None = None, rasas: list[str] | None = None,
                color: str | None = None) -> Film:
    slug = film_slug(title, year)
    film = db.query(Film).filter_by(slug=slug).one_or_none()
    if film is None:
        film = Film(slug=slug, title=title, year=year)
        db.add(film)
        db.flush()
    film.language = language or film.language
    film.navras_score = score if score is not None else film.navras_score
    film.verdict = verdict or film.verdict
    film.era = era or film.era
    film.color = color or film.color
    if ott:
        film.ott = ott
    for i, rasa in enumerate(rasas or []):
        key = rasa.lower()
        exists = any(t.rasa == key and t.source == "human" for t in film.rasa_tags)
        if not exists:
            db.add(RasaTag(film_id=film.id, rasa=key,
                           weight=1.0 - i * 0.1, source="human"))
    return film


def load_mood_films(db: Session) -> int:
    data = json.loads((SEED_DIR / "mood_films.json").read_text())
    n = 0
    for rasa, films in data.items():
        for f in films:
            ott = [{"platform": f["ott"]}] if f.get("ott") else None
            upsert_film(
                db, title=f["title"], year=f.get("year"),
                language=f.get("lang"), score=f.get("score"),
                verdict=f.get("verdict"), era=f.get("era"),
                ott=ott, rasas=f.get("rasas") or [rasa],
                color=f.get("color"),
            )
            n += 1
    return n


def load_lists(db: Session) -> int:
    data = json.loads((SEED_DIR / "lists.json").read_text())
    n = 0
    for category, lists in data.items():
        for lst in lists:
            slug = slugify(lst.get("id") or lst["title"])
            clist = db.query(CuratedList).filter_by(slug=slug).one_or_none()
            if clist is None:
                clist = CuratedList(slug=slug, title=lst["title"])
                db.add(clist)
                db.flush()
            clist.title = lst["title"]
            clist.description = lst.get("desc")
            clist.intro = lst.get("intro")
            clist.category = category
            clist.entries.clear()
            for entry in lst.get("films", []):
                film = upsert_film(
                    db, title=entry["title"], year=entry.get("year"),
                    language=(entry.get("lang") or "").lower() or None,
                    score=entry.get("score"), verdict=entry.get("verdict"),
                    rasas=entry.get("rasas"), color=entry.get("color"),
                )
                clist.entries.append(ListEntry(
                    film_id=film.id, rank=entry.get("rank"),
                    blurb=entry.get("verdict"),
                ))
            n += 1
    return n


def run() -> None:
    Base.metadata.create_all(engine)
    db = SessionLocal()
    try:
        films = load_mood_films(db)
        lists = load_lists(db)
        db.commit()
        total = db.query(Film).count()
        print(f"Seeded: {films} mood entries, {lists} lists, {total} unique films in DB")
    finally:
        db.close()


if __name__ == "__main__":
    run()
