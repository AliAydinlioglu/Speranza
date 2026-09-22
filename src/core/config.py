from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_PATH: Path = Path("/app/data/bundles.db")
    ARGOS_PACKAGES_DIR: Path = Path("/home/appuser/.local/share/argos-translate/packages")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
