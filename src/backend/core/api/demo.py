
from rest_framework.decorators import api_view
from rest_framework.response import Response
from minio import Minio
from django.conf import settings

MINIO_BUCKET = "livekit-staging-livekit-egress"

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

    if bucket_name != MINIO_BUCKET:
        return Response("Not interested in this bucket")

    if object['contentType'] != 'audio/ogg':
        return Response("Not interested in this file type")

    print('file received', filename)

    client = Minio(
        settings.MINIO_URL,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
    )

    room_id = filename.split("_")[2].split(".")[0]

    print('room_id', room_id, filename)


    return Response("")
