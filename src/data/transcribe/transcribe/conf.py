"""Transcribe settings"""

import io
from pathlib import Path
from typing import List

from pydantic import AnyHttpUrl, BaseModel, BaseSettings


class Settings(BaseSettings):
    """Pydantic model for Transcribe's global environment & configuration settings."""

    DEBUG: bool = False

    SERVER_PROTOCOL: str = "http"
    SERVER_HOST: str = "localhost"
    SERVER_PORT: int = 8100

    ROOT_PATH: Path = Path(__file__).parent

    # Security
    ALLOWED_HOSTS: List[str] = []

    # pylint: disable=invalid-name
    @property
    def SERVER_URL(self) -> str:
        """Get the full server URL."""
        return f"{self.SERVER_PROTOCOL}://{self.SERVER_HOST}:{self.SERVER_PORT}"

    class Config:
        """Pydantic Configuration."""

        case_sensitive = True
        env_file = ".env"
        env_file_encoding = getattr(io, "LOCALE_ENCODING", "utf8")
        env_nested_delimiter = "__"
        env_prefix = "TRANSCRIBE_"


settings = Settings()
