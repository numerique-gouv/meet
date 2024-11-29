"""API routes related to application tasks."""

from celery.result import AsyncResult
from fastapi import APIRouter
from pydantic import BaseModel

from summary.core.celery_worker import process_audio_transcribe_summarize


class TaskCreation(BaseModel):
    """Task data."""

    filename: str
    email: str
    sub: str


router = APIRouter(prefix="/tasks")


@router.post("/")
async def create_task(request: TaskCreation):
    """Create a task."""
    task = process_audio_transcribe_summarize.delay(
        request.filename, request.email, request.sub
    )
    return {"id": task.id, "message": "Task created"}


@router.get("/{task_id}")
async def get_task_status(task_id: str):
    """Check task status by ID."""
    task = AsyncResult(task_id)
    return {"id": task_id, "status": task.status}
