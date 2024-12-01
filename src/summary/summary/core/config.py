"""Application configuration and settings."""

from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings loaded from environment variables and .env file."""

    model_config = SettingsConfigDict(env_file=".env")

    app_name: str = "app"
    app_api_v1_str: str = "/api/v1"
    app_api_token: str

    # Celery settings
    celery_broker_url: str = "redis://redis/0"
    celery_result_backend: str = "redis://redis/0"

    # Minio settings
    aws_storage_bucket_name: str
    aws_s3_endpoint_url: str
    aws_s3_access_key_id: str
    aws_s3_secret_access_key: str
    aws_s3_secure_access: bool = True

    # AI-related settings
    openai_api_key: str
    openai_base_url: str = "https://api.openai.com/v1"
    openai_asr_model: str = "whisper-1"
    openai_llm_model: str = "gpt-4o"

    # Webhook-related settings
    webhook_max_retries: int = 2
    webhook_status_forcelist: list[int] = [502, 503, 504]
    webhook_backoff_factor: float = 0.1
    webhook_api_token: str
    webhook_url: str


@lru_cache
def get_settings():
    """Load and cache application settings."""
    return Settings()


SettingsDeps = Annotated[Settings, Depends(get_settings)]
