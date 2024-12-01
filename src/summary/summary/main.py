"""Application."""

import sentry_sdk
from fastapi import FastAPI

from summary.api import health
from summary.api.main import api_router
from summary.core.config import get_settings

settings = get_settings()


if settings.sentry_dsn and settings.sentry_is_enabled:
    sentry_sdk.init(dsn=settings.sentry_dsn, enable_tracing=True)

app = FastAPI(
    title=settings.app_name,
)

app.include_router(api_router, prefix=settings.app_api_v1_str)
app.include_router(health.router)
