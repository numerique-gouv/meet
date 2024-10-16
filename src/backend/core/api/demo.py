
from rest_framework.decorators import api_view
from rest_framework.response import Response
from minio import Minio
from django.conf import settings
import openai
import logging
from ..models import Room, RoleChoices

import tempfile
import os
import smtplib


logger = logging.getLogger(__name__)


def get_prompt(transcript):
    return f"""
    You are a helpful assistant.

    Summarize the following meeting transcript into a structured meeting minute format without additional comments about the meeting itself. Organize the summary into multiple parts, omitting the parts that are not applicable:

    1. Summary: Provide a short summary of the entire conversation.
    2. Subjects Discussed: Provide a concise list of the main topics or issues covered during the meeting.
    3. Decisions Taken: Clearly and concisely state the decisions or resolutions that were agreed upon in short bullet points. Ensure that all decisions are well-defined and actionable.
    4. Next Steps: List action items or tasks in brief bullet points, including the responsible persons and deadlines (if mentioned). Make sure no action item is left unassigned or without a deadline if one is mentioned.

    If any part of the transcript is unclear or requires further precision, please notify the user gently, suggesting specific areas that may need additional information. Review everything carefully, make sure not to make unsubstantiated claims.

    Please keep proper markdown title and formatting in the answer.

    {transcript}

    Answer:

    ## Summary
    [provide a summary of the entire conversation]

    ## Subjects Discussed:
    - [Concise bullet point summarizing subject]
    - [Concise bullet point summarizing subject]

    ## Decisions Taken:
    - [Clear and actionable decision]
    - [Clear and actionable decision]

    ## Next Steps:
    - [Action item or task] - [Responsible person, if applicable] - [Deadline, if applicable]
    - [Action item or task] - [Responsible person, if applicable] - [Deadline, if applicable]
    """


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

    if bucket_name != settings.MINIO_BUCKET:
        logger.info('Not interested in this bucket: %s', bucket_name)
        return Response("Not interested in this bucket")

    if object['contentType'] != 'audio/ogg':
        logger.info('Not interested in this file type: %s', object['contentType'])
        return Response("Not interested in this file type")

    room_slug = filename.split("_")[2].split(".")[0]
    logger.info('file received %s for room %s', filename, room_slug)

    try:
        client = Minio(
            settings.MINIO_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
        )
    except Exception as e:
        logger.error("An error occurred while creating the Minio client %s: %s", settings.MINIO_URL, str(e))

    temp_file_path = None

    try:
        logger.info('downloading file %s', filename)
        
        try:

            audio_file_stream = client.get_object(settings.MINIO_BUCKET, object_name=filename)

            with tempfile.NamedTemporaryFile(delete=False, suffix='.ogg') as temp_audio_file:
                for data in audio_file_stream.stream(32*1024):
                    temp_audio_file.write(data)

                temp_file_path = temp_audio_file.name
                logger.info('Temporary file created at %s', temp_file_path)

            audio_file_stream.close()
            audio_file_stream.release_conn()

        except Exception as e:
            logger.error("An error occurred while accessing the object: %s", str(e))
            return Response("")

        if settings.OPENAI_ENABLE and temp_file_path:

            openai_client = openai.OpenAI(
                api_key=settings.OPENAI_API_KEY,
            )

            with open(temp_file_path, "rb") as audio_file:
                
                logger.info('Querying transcription …')

                transcript = openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )

            logger.info('Transcript: %s', transcript)

            prompt = get_prompt(transcript)

            logger.info('Prompt: %s', prompt)

            summary_response = openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert assistant that summarizes meeting transcripts."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150 # todo - dig what does this parameter
            )

            summary = summary_response.choices[0].message.content
            logger.info('Summary: %s', summary)

    except Exception as e:
        logger.error("An error occurred: %s", str(e))
        raise

    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            logger.info("Temporary file %s has been deleted.", temp_file_path)

    try:
        room = Room.objects.get(slug="fqj-hvzr-ieh")
        owner_accesses = room.accesses.filter(role=RoleChoices.OWNER)
        owners = [access.user for access in owner_accesses]
        logger.info("Room %s has owners: %s", room_slug, owners)

    except Room.DoesNotExist:
        logger.error("Room with slug %s does not exist", room_slug)
        owners = None
        room = None

    if not owners or not room:
        logger.error("No owners")
        return Response("")

    # todo - get link

    try:
        logger.info("Emailing owners: %s", owners)
        room.email_summary(owners=owners, link="wip")
    except smtplib.SMTPException:
        logger.error("Error while emailing owners")
        return Response("")


    return Response("")
