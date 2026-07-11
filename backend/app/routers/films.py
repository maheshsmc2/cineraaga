from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Film
from ..services.export import film_card, film_detail

router = APIRouter(prefix="/api/films", tags=["films"])


@router.get("")
def list_films(language: str | None = None, rasa: str | None = None,
               db: Session = Depends(get_db)):
    q = db.query(Film)
    if language:
        q = q.filter(Film.language == language)
    films = q.all()
    if rasa:
        films = [f for f in films if rasa in f.rasas]
    return [film_card(f) for f in films]


@router.get("/{slug}")
def get_film(slug: str, db: Session = Depends(get_db)):
    film = db.query(Film).filter_by(slug=slug).one_or_none()
    if film is None:
        raise HTTPException(404, "film not found")
    return film_detail(film)
