
from rest_framework.decorators import api_view
from rest_framework.response import Response
from minio import Minio
from django.conf import settings
import openai


openai_client = openai.OpenAI(
    api_key=settings.OPENAI_API_KEY,
)

# todo - discuss retry policy if the webhook fail
@api_view(["POST"])
def minio_webhook(request):

    data = request.data

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

    print('file received', filename)

    client = Minio(
        settings.AWS_S3_ENDPOINT_URL,
        access_key=settings.AWS_S3_ACCESS_KEY_ID,
        secret_key=settings.AWS_S3_SECRET_ACCESS_KEY,
    )

    room_id = filename.split("_")[2].split(".")[0]

    print('room_id', room_id, filename)


    return Response("")