"""Module for managing application configuration and settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings loaded from environment variables and .env file."""

    app_name: str = "Awesome API"
    model_config = SettingsConfigDict(env_file=".env")
