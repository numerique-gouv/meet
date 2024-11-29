"""API routes."""

from fastapi import APIRouter, Depends

from summary.api.route import tasks
from summary.core.security import verify_token

api_router = APIRouter(dependencies=[Depends(verify_token)])
api_router.include_router(tasks.router, tags=["tasks"])
