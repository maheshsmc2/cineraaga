"""CineRaaga API — month-2 live layer. At launch, only the export pipeline runs."""
from fastapi import FastAPI

from .routers import films, lists, mood

app = FastAPI(title="CineRaaga API", version="0.1.0")
app.include_router(films.router)
app.include_router(lists.router)
app.include_router(mood.router)


@app.get("/health")
def health():
    return {"status": "ok"}
