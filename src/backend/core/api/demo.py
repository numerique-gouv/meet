
from rest_framework.decorators import api_view
from rest_framework.response import Response

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

    return Response("")
