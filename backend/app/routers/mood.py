from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import RASAS, Film
from ..services.export import film_card

router = APIRouter(prefix="/api/mood", tags=["mood"])


@router.get("/{rasa}")
def films_by_rasa(rasa: str, db: Session = Depends(get_db)):
    if rasa not in RASAS:
        raise HTTPException(404, f"unknown rasa: {rasa}")
    films = [f for f in db.query(Film).all() if rasa in f.rasas]
    films.sort(key=lambda f: (-(f.navras_score or 0), f.title))
    return {"rasa": rasa, "count": len(films), "films": [film_card(f) for f in films]}
