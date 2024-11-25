"""Application endpoint."""

from fastapi import Depends, FastAPI
from pydantic import BaseModel

from .celery_worker import send_push_notification
from .security import verify_token

app = FastAPI()


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
async def notify(request: NotificationRequest, token: str = Depends(verify_token)):
    """Push a notification."""
    send_push_notification.delay(request.filename, request.email, request.sub)
    return {"message": "Notification sent"}
