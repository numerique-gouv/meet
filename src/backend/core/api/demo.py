
from rest_framework.decorators import api_view
from rest_framework.response import Response
from minio import Minio
from django.conf import settings
import openai
import logging

import tempfile
import os


logger = logging.getLogger(__name__)


# todo - discuss retry policy if the webhook fail
@api_view(["POST"])
def minio_webhook(request):

    data = request.data

    logger.info('Minio webhook sent %s', data)

    record = data["Records"][0]
    s3 = record['s3']
    bucket = s3['bucket']
    bucket_name = bucket['name']
    object = s3['object']
    filename = object['key']

    if bucket_name != settings.AWS_STORAGE_BUCKET_NAME:
        return Response("Not interested in this bucket")

    if object['contentType'] != 'audio/ogg':
        return Response("Not interested in this file type")

    room_id = filename.split("_")[2].split(".")[0]
    logger.info('file received %s for room %s', filename, room_id)

    client = Minio(
        settings.AWS_S3_ENDPOINT_URL,
        access_key=settings.AWS_S3_ACCESS_KEY_ID,
        secret_key=settings.AWS_S3_SECRET_ACCESS_KEY,
    )

    try:
        logger.info('downloading file %s', filename)
        audio_file_stream = client.get_object(settings.AWS_STORAGE_BUCKET_NAME, object_name=filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.ogg') as temp_audio_file:
            for data in audio_file_stream.stream(32*1024):
                temp_audio_file.write(data)

            temp_file_path = temp_audio_file.name
            logger.info('Temporary file created at %s', temp_file_path)

        audio_file_stream.close()
        audio_file_stream.release_conn()

        if settings.OPENAI_ENABLE:

            openai_client = openai.OpenAI(
                api_key=settings.OPENAI_API_KEY,
            )

            with open(temp_file_path, "rb") as audio_file:
                
                logger.info('Querying transcription …')

                transcript = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )

            logger.info(transcript)

    except Exception as e:
        logger.error("An error occurred: %s", str(e))
        raise

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            logger.info("Temporary file %s has been deleted.", temp_file_path)


    return Response("")
