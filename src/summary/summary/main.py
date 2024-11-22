"""Application entry point."""

from functools import lru_cache
from typing import Annotated

from fastapi import Depends, FastAPI
from pydantic import BaseModel

from .celery_worker import send_push_notification
from .config import Settings


app = FastAPI()


@lru_cache
def get_settings():
    """Load and cache application settings."""
    return Settings()


@app.get("/")
async def root(settings: Annotated[Settings, Depends(get_settings)]):
    """Root endpoint that returns app name."""
    return {"message": f"Hello World, using {settings.app_name}"}


@app.get("/__heartbeat__")
async def heartbeat():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}


@app.get("/__lbheartbeat__")
async def lbheartbeat():
    """Health check endpoint for load balancer."""
    return {"status": "ok"}


class NotificationRequest(BaseModel):
    """Notification data."""

    filename: str
    email: str
    sub: str


@app.post("/push")
async def notify(request: NotificationRequest):
    """Push a notification."""
    send_push_notification.delay(request.filename, request.email, request.sub)
    return {"message": "Notification sent"}
