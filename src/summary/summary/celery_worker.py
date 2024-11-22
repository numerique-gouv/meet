"""Celery workers."""

import tempfile
from pathlib import Path

import openai
from celery import Celery
from celery.utils.log import get_task_logger
from minio import Minio

from .config import Settings
from .prompt import get_instructions

settings = Settings()


logger = get_task_logger(__name__)

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


@celery.task(max_retries=1)
def send_push_notification(filename: str):
    """Mock push notification."""
    logger.info("Notification received")
    logger.debug("filename: %s", filename)

    minio_client = Minio(
        settings.minio_url,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
    )

    logger.debug("Connection to the Minio bucket successful")

    audio_file_stream = minio_client.get_object(
        settings.minio_bucket, object_name=filename
    )

    temp_file_path = save_audio_stream(audio_file_stream)
    logger.debug("Recording successfully downloaded, filepath: %s", temp_file_path)

    logger.debug("Initiating OpenAI client")
    openai_client = openai.OpenAI(
        api_key=settings.openai_api_key,
    )

    logger.debug("Querying transcription …")
    with open(temp_file_path, "rb") as audio_file:
        transcription = openai_client.audio.transcriptions.create(
            model="whisper-1", file=audio_file
        )

        transcription = transcription.text

        logger.debug("Transcription: \n %s", transcription)

    instructions = get_instructions(transcription)
    summary_response = openai_client.chat.completions.create(
        model="gpt-4o", messages=instructions
    )

    summary = summary_response.choices[0].message.content
    logger.debug("Summary: \n %s", summary)
