"""Celery workers."""

import json
import tempfile
from pathlib import Path

import openai
from celery import Celery
from celery.utils.log import get_task_logger
from minio import Minio
from requests import Session
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

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


def create_retry_session():
    """Wip."""
    session = Session()
    retries = Retry(
        total=settings.webhook_max_retries,
        backoff_factor=settings.webhook_backoff_factor,
        status_forcelist=settings.webhook_status_forcelist,
        allowed_methods={"POST"},
    )
    session.mount("https://", HTTPAdapter(max_retries=retries))
    return session


def post_with_retries(url, data):
    """Wip."""
    session = create_retry_session()
    session.headers.update({"Authorization": f"Bearer {settings.webhook_api_token}"})
    try:
        response = session.post(url, json=data)
        response.raise_for_status()
        return response
    finally:
        session.close()


@celery.task(max_retries=1)
def send_push_notification(filename: str, email: str, sub: str):
    """Mock push notification."""
    logger.info("Notification received")
    logger.debug("filename: %s", filename)

    minio_client = Minio(
        settings.aws_s3_endpoint_url,
        access_key=settings.aws_s3_access_key_id,
        secret_key=settings.aws_s3_secret_access_key,
        secure=settings.aws_s3_secure_access,
    )

    logger.debug("Connection to the Minio bucket successful")

    audio_file_stream = minio_client.get_object(
        settings.aws_storage_bucket_name, object_name=filename
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

    data = {
        "summary": summary,
        "email": email,
        "sub": sub,
    }

    logger.debug("Submitting webhook to %s", settings.webhook_url)
    logger.debug("Request payload: %s", json.dumps(data, indent=2))

    response = post_with_retries(settings.webhook_url, data)

    logger.info("Webhook submitted successfully. Status: %s", response.status_code)
    logger.debug("Response body: %s", response.text)
