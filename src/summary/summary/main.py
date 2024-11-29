"""Application."""

from fastapi import FastAPI

from summary.api import health
from summary.api.main import api_router
from summary.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
)

app.include_router(api_router, prefix=settings.app_api_v1_str)
app.include_router(health.router)
