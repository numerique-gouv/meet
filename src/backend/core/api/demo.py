
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
import requests


logger = logging.getLogger(__name__)


def get_prompt(transcript, date):
    return f"""
    Generate structured meeting minutes from transcripts using the following format:
    
    ## Instructions
    Summarize the meeting transcript in a clear, organized format. Include only applicable sections:
    
    1. Summary (2-3 sentences maximum)
    2. Key Topics
    3. Decisions
    4. Action Items & Next Steps
    
    Keep the original language of the transcript. Flag any unclear items that need clarification.
    If any part of the transcript is unclear or requires further precision, please notify the user gently, suggesting specific areas that may need additional information.
    Review everything carefully, make sure not to make unsubstantiated claims.
    
    Template:
    
    ### Meeting - [meeting's date YYYY-MM-DD]
    [Brief overview of meeting purpose and outcomes]
    
    ### Key Topics
    - [Topic 1]
    - [Topic 2]
    
    ### Decisions
    - [Decision 1: Clear, actionable, if applicable]
    - [Decision 2: Clear, actionable, if applicable]
    
    ### Action Items
    - [ ] Task: [Description] - [Name, if applicable] - [Deadline, if applicable]
    
    Please translate the template to the language of the transcript.
    Please keep proper markdown title and formatting in the answer.
    
    Transcript:
    {transcript}
    
    Meeting's date: {date}
    """


def get_room_and_owners(slug):
    """Wip."""

    try:
        room = Room.objects.get(slug=slug)
        owner_accesses = room.accesses.filter(role=RoleChoices.OWNER)
        owners = [access.user for access in owner_accesses]

        logger.info("Room %s has owners: %s", slug, owners)

    except Room.DoesNotExist:
        logger.error("Room with slug %s does not exist", slug)

        owners = None
        room = None

    return room, owners


def remove_temporary_file(path):
    """Wip."""

    if not path or not os.path.exists(path):
        return

    os.remove(path)
    logger.info("Temporary file %s has been deleted.", path)

def get_blocknote_content(summary):
    """Wip."""

    if not settings.BLOCKNOTE_CONVERTER_URL:
        logger.error("BLOCKNOTE_CONVERTER_URL is not configured")
        return None

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "markdown": summary
    }

    logger.info("Converting summary in BlockNote.js…")
    response = requests.post(settings.BLOCKNOTE_CONVERTER_URL, headers=headers, json=data)

    if response.status_code != 200:
        logger.error(f"Failed to convert summary. Status code: {response.status_code}")
        return None

    response_data = response.json()
    if not 'content' in response_data:
        logger.error(f"Content is missing: %s", response_data)
        return None

    content = response_data['content']
    logger.info("Base64 content: %s", content)

    return content



def get_document_link(content, email):
    """Wip."""

    logger.info("Create a document for %s", email)

    if not settings.DOCS_BASE_URL:
        logger.error("DOCS_BASE_URL is not configured")
        return None

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "content": content,
        "owner": email
    }

    logger.info("Querying docs…")
    response = requests.post(f"{settings.DOCS_BASE_URL}/api/v1.0/summary/", headers=headers, json=data)

    if response.status_code != 200:
        logger.error(f"Failed to get document's id. Status code: {response.status_code}")
        return None

    response_data = response.json()
    if not 'id' in response_data:
        logger.error(f"ID is missing: %s", response_data)
        return None

    id = response_data['id']
    logger.info("Document's id: %s", id)

    return f"{settings.DOCS_BASE_URL}/docs/{id}/"


def email_owner_with_summary(room, link, owner):
    """Wip."""

    logger.info("Emailing owner: %s", owner)

    try:
        room.email_summary(owners=[owner], link=link)
    except smtplib.SMTPException:
        logger.error("Error while emailing owner")

def strip_room_slug(filename):
    """Wip."""
    return filename.split("_")[2].split(".")[0]

def strip_room_date(filename):
    """Wip."""
    return filename.split("_")[1].split(".")[0]


def get_minio_client():
    """Wip."""

    try:
        return Minio(
            settings.MINIO_URL,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
        )
    except Exception as e:
        logger.error("An error occurred while creating the Minio client %s: %s", settings.MINIO_URL, str(e))


def download_temporary_file(minio_client, filename):
    """Wip."""

    temp_file_path = None

    logger.info('downloading file %s', filename)

    try:
        audio_file_stream = minio_client.get_object(settings.MINIO_BUCKET, object_name=filename)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.ogg') as temp_audio_file:

            for data in audio_file_stream.stream(32 * 1024):
                temp_audio_file.write(data)

            temp_file_path = temp_audio_file.name
            logger.info('Temporary file created at %s', temp_file_path)

        audio_file_stream.close()
        audio_file_stream.release_conn()

    except Exception as e:
        logger.error("An error occurred while accessing the object: %s", str(e))

    return temp_file_path


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

    room_slug = strip_room_slug(filename)
    room_date = strip_room_date(filename)
    logger.info('file received %s for room %s', filename, room_slug)

    minio_client = get_minio_client()

    temp_file_path = None
    summary = None

    try:
        temp_file_path = download_temporary_file(minio_client, filename)

        if settings.OPENAI_ENABLE and temp_file_path:
            logger.info('Initiating OpenAI client …')
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
            prompt = get_prompt(transcript.text, room_date)

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
        remove_temporary_file(temp_file_path)

    if not summary:
        logger.error("Empty summary.")
        return Response("")

    room, owners = get_room_and_owners(room_slug)

    if not owners or not room:
        logger.error("No owners in room %s", room_slug)
        return Response("")

    content = get_blocknote_content(summary)

    if not content:
        logger.error("Empty content.")
        return Response("")

    owner = owners[0]

    link = get_document_link(content, owner.email)

    if not link:
        logger.error("Empty link.")
        return Response("")

    email_owner_with_summary(room, link, owner)

    return Response("")
