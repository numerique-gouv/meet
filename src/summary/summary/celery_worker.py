"""Celery workers."""

import time

from celery import Celery

from .config import Settings

settings = Settings()


celery = Celery(
    __name__,
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    broker_connection_retry_on_startup=True,
)


@celery.task
def send_push_notification(device_token: str):
    """Mock push notification."""
    time.sleep(10)
    print("notification sent")  # noqa: T201
