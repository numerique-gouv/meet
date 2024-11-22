"""Module for managing application configuration and settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings loaded from environment variables and .env file."""

    app_name: str = "Awesome API"
    model_config = SettingsConfigDict(env_file=".env")

    # Celery settings
    celery_broker_url: str = "redis://redis/0"
    celery_result_backend: str = "redis://redis/0"

    # Minio settings
    minio_bucket: str
    minio_url: str
    minio_access_key: str
    minio_secret_key: str
