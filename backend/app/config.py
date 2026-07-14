"""Application configuration, loaded from environment / .env file."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://cineraaga:cineraaga@localhost:5432/cineraaga"
    tmdb_api_key: str = ""
    tmdb_base: str = "https://api.themoviedb.org/3"
    export_dir: str = "../frontend/navras/data"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
