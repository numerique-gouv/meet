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

    # AI-related settings
    openai_api_key: str

    # Webhook-related settings
    webhook_max_retries: int = 2
    webhook_status_forcelist: list[int] = [502, 503, 504]
    webhook_backoff_factor: float = 0.1
    webhook_api_token: str
    webhook_url: str
