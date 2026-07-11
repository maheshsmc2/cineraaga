"""The pipeline test: seed data → DB → static JSON export."""
import json

from app.models import Film
from app.services import export, seed


def seed_all(db):
    seed.load_mood_films(db)
    seed.load_lists(db)
    db.commit()


def test_seed_loads_films_without_duplicates(db):
    seed_all(db)
    films = db.query(Film).all()
    assert len(films) > 50
    slugs = [f.slug for f in films]
    assert len(slugs) == len(set(slugs)), "duplicate slugs"


def test_seed_is_idempotent(db):
    seed_all(db)
    n1 = db.query(Film).count()
    seed_all(db)
    assert db.query(Film).count() == n1


def test_scores_only_exist_when_hand_scored(db):
    seed_all(db)
    for f in db.query(Film).all():
        if f.navras_score is not None:
            assert 0 <= f.navras_score <= 100


def test_every_seeded_film_has_at_least_one_human_rasa(db):
    seed_all(db)
    for f in db.query(Film).all():
        assert f.rasas, f"{f.slug} has no human rasa tags"


def test_export_writes_all_surfaces(db, tmp_path):
    seed_all(db)
    stats = export.export_all(db, out_dir=tmp_path)
    assert stats["films"] > 50
    assert (tmp_path / "films" / "index.json").exists()
    assert (tmp_path / "lists" / "index.json").exists()
    for rasa in ("karuna", "veera", "hasya"):
        payload = json.loads((tmp_path / "mood" / f"{rasa}.json").read_text())
        assert payload["count"] > 0
        assert all(rasa in f["rasas"] for f in payload["films"])


def test_mood_export_sorted_by_score(db, tmp_path):
    seed_all(db)
    export.export_all(db, out_dir=tmp_path)
    payload = json.loads((tmp_path / "mood" / "karuna.json").read_text())
    scores = [f["navras_score"] or 0 for f in payload["films"]]
    assert scores == sorted(scores, reverse=True)


def test_prototype_scores_are_marked_placeholder(db, tmp_path):
    """Brand rule: a Navras Score is Mahe's judgment. Imported prototype
    numbers must carry score_status='placeholder' so the frontend never
    presents them as editorial scores."""
    seed_all(db)
    import json as _json
    from app.services import export as _export
    _export.export_all(db, out_dir=tmp_path)
    cards = _json.loads((tmp_path / "films" / "index.json").read_text())
    assert cards, "no films exported"
    assert all(c["score_status"] == "placeholder" for c in cards)
