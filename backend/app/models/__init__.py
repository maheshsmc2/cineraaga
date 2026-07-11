"""CineRaaga data models.

Design principles:
- TMDb supplies commodity metadata (title, year, posters) via tmdb_id.
- The proprietary layer is everything else: Navras scores, rasa tags,
  verdicts, reviews, curated lists. navras_score is NULLABLE on purpose —
  a film only carries a score when Mahe has scored it. No score is ever
  derived from crowd ratings.
- RasaTag.source distinguishes human tags from AI-suggested tags, which
  is the foundation for the month-3 classification eval set.
"""
from datetime import datetime, date, timezone


def _now():
    return datetime.now(timezone.utc)

from sqlalchemy import (
    JSON, Date, DateTime, Float, ForeignKey, Integer, String, Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base

RASAS = (
    "shringara", "hasya", "karuna", "veera", "bhayanaka",
    "adbhuta", "raudra", "shanta", "bibhatsa",
)

LANGUAGES = ("hindi", "tamil", "telugu", "malayalam", "punjabi")


class Film(Base):
    __tablename__ = "films"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    tmdb_id: Mapped[int | None] = mapped_column(Integer, unique=True)
    title: Mapped[str] = mapped_column(String(300))
    year: Mapped[int | None]
    language: Mapped[str | None] = mapped_column(String(20), index=True)
    poster_path: Mapped[str | None] = mapped_column(String(200))
    backdrop_path: Mapped[str | None] = mapped_column(String(200))
    overview: Mapped[str | None] = mapped_column(Text)

    # --- proprietary layer ---
    navras_score: Mapped[int | None]          # 0-100, only when hand-scored
    # 'placeholder' = imported from the v49 prototype, NOT editorial judgment.
    # 'official' = scored by Mahe. The frontend must only show a Navras Score
    # badge when score_status == 'official'.
    score_status: Mapped[str] = mapped_column(String(12), default="placeholder")
    verdict: Mapped[str | None] = mapped_column(Text)  # 2-3 line judgment
    era: Mapped[str | None] = mapped_column(String(20))  # classic/2000s/2010s/new
    color: Mapped[str | None] = mapped_column(String(9))  # poster tint fallback
    ott: Mapped[list | None] = mapped_column(JSON)  # [{"platform": "netflix", "url": ...}]
    ott_checked_at: Mapped[date | None] = mapped_column(Date)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=_now, onupdate=_now
    )

    rasa_tags: Mapped[list["RasaTag"]] = relationship(
        back_populates="film", cascade="all, delete-orphan"
    )
    review: Mapped["Review | None"] = relationship(back_populates="film", uselist=False)

    @property
    def rasas(self) -> list[str]:
        """Human-confirmed rasas, strongest first."""
        tags = [t for t in self.rasa_tags if t.source == "human"]
        tags.sort(key=lambda t: -(t.weight or 0))
        return [t.rasa for t in tags]


class RasaTag(Base):
    __tablename__ = "rasa_tags"
    __table_args__ = (UniqueConstraint("film_id", "rasa", "source"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    film_id: Mapped[int] = mapped_column(ForeignKey("films.id"), index=True)
    rasa: Mapped[str] = mapped_column(String(20), index=True)
    weight: Mapped[float | None] = mapped_column(Float, default=1.0)
    source: Mapped[str] = mapped_column(String(10), default="human")  # human | ai
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    film: Mapped[Film] = relationship(back_populates="rasa_tags")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    film_id: Mapped[int] = mapped_column(ForeignKey("films.id"), unique=True)
    title: Mapped[str] = mapped_column(String(300))
    body_md: Mapped[str] = mapped_column(Text)  # written by Mahe, never AI
    published_at: Mapped[date | None] = mapped_column(Date, index=True)

    film: Mapped[Film] = relationship(back_populates="review")


class CuratedList(Base):
    __tablename__ = "lists"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    intro: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(30), index=True)  # ott/rasa/language/evergreen
    updated_at: Mapped[date | None] = mapped_column(Date)

    entries: Mapped[list["ListEntry"]] = relationship(
        back_populates="curated_list",
        cascade="all, delete-orphan",
        order_by="ListEntry.rank",
    )


class ListEntry(Base):
    __tablename__ = "list_entries"
    __table_args__ = (UniqueConstraint("list_id", "film_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id"), index=True)
    film_id: Mapped[int] = mapped_column(ForeignKey("films.id"))
    rank: Mapped[int | None]
    blurb: Mapped[str | None] = mapped_column(Text)  # per-entry 2-3 lines of judgment

    curated_list: Mapped[CuratedList] = relationship(back_populates="entries")
    film: Mapped[Film] = relationship()
