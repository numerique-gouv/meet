"""Wip"""

import logging

from fastapi import APIRouter, Response

logger = logging.getLogger(__name__)



router = APIRouter()

@router.get("/__lbheartbeat__")
async def lbheartbeat() -> None:
    """Load balancer heartbeat.

    Return a 200 when the server is running.
    """
    return


@router.get("/__heartbeat__")
async def heartbeat() -> None:
    """Application heartbeat.

    Return a 200 when the server is running.
    """
    return
