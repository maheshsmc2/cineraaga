# CineRaaga

Curated Indian cinema discovery and reviews across Hindi, Tamil, Telugu,
Malayalam and Punjabi. Editorial authority, not a crowd platform.

**Navras** is the internal method layer: nine-rasa mood taxonomy and the
hand-assigned Navras Score (0–100). A score only exists when it has been
personally assigned — nothing is ever derived from crowd ratings.

## Architecture (launch mode: static export)

```
backend/    FastAPI + SQLAlchemy. Source of truth (Postgres via docker-compose,
            SQLite for quick local work). Seed → DB → static JSON export.
frontend/   Static HTML/CSS/JS served by Vercel. Reads frontend/data/*.json.
```

At launch nothing runs live — the export output is committed and deployed.
The FastAPI routers become the live layer in month 2.

## Workflow

```bash
cd backend
pip install -r requirements.txt
export DATABASE_URL=sqlite:///./cineraaga.db   # or Postgres from docker-compose
python -m app.services.seed      # idempotent
python -m app.services.export    # writes ../frontend/data/
pytest -q
```

## Data rules

- `Film.navras_score` is nullable. `score_status` is `placeholder` for
  numbers imported from the old prototype and `official` only when
  hand-scored. The frontend renders a score badge **only** for `official`.
- `RasaTag.source` is `human` or `ai` — the basis for the month-3
  classification eval set.
- Reviews (`body_md`) are written by a human. Always.
