"""Celery workers."""

import tempfile
from pathlib import Path

from celery import Celery
from minio import Minio

from .config import Settings

settings = Settings()


celery = Celery(
    __name__,
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    broker_connection_retry_on_startup=True,
)


def save_audio_stream(audio_stream, chunk_size=32 * 1024):
    """Wip."""
    with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as tmp:
        tmp.writelines(audio_stream.stream(chunk_size))
        return Path(tmp.name)


@celery.task
def send_push_notification(filename: str):
    """Mock push notification."""
    print("notification received")  # noqa: T201
    print(f"filename: {filename}")  # noqa: T201

    minio_client = Minio(
        settings.minio_url,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
    )

    print("Connected to the bucket")  # noqa: T201

    audio_file_stream = minio_client.get_object(
        settings.minio_bucket, object_name=filename
    )

    temp_file_path = save_audio_stream(audio_file_stream)
    print(f"file downloaded {temp_file_path}")  # noqa: T201
