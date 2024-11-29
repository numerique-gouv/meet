"""API routes related to application health checking."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/__heartbeat__")
async def heartbeat():
    """Health check endpoint for monitoring."""
    return


@router.get("/__lbheartbeat__")
async def lbheartbeat():
    """Health check endpoint for load balancer."""
    return
