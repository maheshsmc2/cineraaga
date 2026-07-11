from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import CuratedList
from ..services.export import film_card

router = APIRouter(prefix="/api/lists", tags=["lists"])


@router.get("")
def list_lists(db: Session = Depends(get_db)):
    return [{"slug": l.slug, "title": l.title, "category": l.category,
             "count": len(l.entries)} for l in db.query(CuratedList).all()]


@router.get("/{slug}")
def get_list(slug: str, db: Session = Depends(get_db)):
    lst = db.query(CuratedList).filter_by(slug=slug).one_or_none()
    if lst is None:
        raise HTTPException(404, "list not found")
    return {"slug": lst.slug, "title": lst.title, "intro": lst.intro,
            "entries": [{"rank": e.rank, "blurb": e.blurb,
                         "film": film_card(e.film)} for e in lst.entries]}
