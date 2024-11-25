"""Application endpoint."""

from celery.result import AsyncResult
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
    task = send_push_notification.delay(request.filename, request.email, request.sub)
    return {"task_id": task.id, "message": "Notification sent"}


@app.get("/status/{task_id}")
async def get_status(task_id: str, token: str = Depends(verify_token)):
    """Check task status by ID."""
    task = AsyncResult(task_id)
    return {"task_id": task_id, "status": task.status}
