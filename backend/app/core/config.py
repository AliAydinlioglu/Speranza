import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


def get_default_database_path() -> Path:
    container_data_dir = Path("/app/data")
    if container_data_dir.exists() and os.access(container_data_dir, os.W_OK):
        return container_data_dir / "bundles.db"
    local_data_dir = PROJECT_ROOT / "data"
    local_data_dir.mkdir(parents=True, exist_ok=True)
    return local_data_dir / "bundles.db"


def get_default_static_dir() -> Path:
    container_static = Path("/app/frontend/static")
    if container_static.exists():
        return container_static
    return PROJECT_ROOT / "frontend" / "static"


def get_default_templates_dir() -> Path:
    container_templates = Path("/app/frontend/templates")
    if container_templates.exists():
        return container_templates
    return PROJECT_ROOT / "frontend" / "templates"


try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        DATABASE_PATH: Path = get_default_database_path()
        ARGOS_PACKAGES_DIR: Path = Path(
            os.getenv(
                "ARGOS_PACKAGES_DIR",
                "/home/appuser/.local/share/argos-translate/packages",
            )
        )
        STATIC_DIR: Path = get_default_static_dir()
        TEMPLATES_DIR: Path = get_default_templates_dir()

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore",
        )
except ImportError:
    class Settings:
        def __init__(self):
            self.DATABASE_PATH = Path(
                os.getenv("DATABASE_PATH", str(get_default_database_path()))
            )
            self.ARGOS_PACKAGES_DIR = Path(
                os.getenv(
                    "ARGOS_PACKAGES_DIR",
                    "/home/appuser/.local/share/argos-translate/packages",
                )
            )
            self.STATIC_DIR = get_default_static_dir()
            self.TEMPLATES_DIR = get_default_templates_dir()


settings = Settings()
