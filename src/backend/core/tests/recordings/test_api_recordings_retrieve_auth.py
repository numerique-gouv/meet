"""
Test file downloads API endpoint for users in Meet's core app.
"""

from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import default_storage
from django.utils import timezone

import pytest
import requests
from rest_framework.test import APIClient

from core import factories, models

pytestmark = pytest.mark.django_db


# This is a minimal MP4 file header, which creates a 1-second empty video
VIDEO_BYTES = (
    b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42mp41"
    b"\x00\x00\x00\x08free\x00\x00\x02\xeemdat"
)


@pytest.mark.parametrize("is_public", [True, False])
def test_api_recordings_retrieve_auth_anonymous(is_public):
    """Anonymous users should not be able to retrieve recordings for a room."""
    room = factories.RoomFactory(is_public=is_public)
    recording = room.start_recording()

    default_storage.connection.meta.client.put_object(
        Bucket=default_storage.bucket_name,
        Key=recording.key,
        Body=VIDEO_BYTES,
        ContentType="video/mp4",
    )

    original_url = f"http://localhost/media/{recording.key:s}"
    response = APIClient().get(
        "/api/v1.0/recordings/retrieve-auth/", HTTP_X_ORIGINAL_URL=original_url
    )

    assert response.status_code == 401


@pytest.mark.parametrize("is_public", [True, False])
def test_api_recordings_retrieve_auth_authenticated(is_public):
    """
    Authenticated users who are not related to a room should not be able to
    retrieve recordings for this room.
    """
    room = factories.RoomFactory(is_public=is_public)
    recording = room.start_recording()

    user = factories.UserFactory()
    client = APIClient()
    client.force_login(user)

    default_storage.connection.meta.client.put_object(
        Bucket=default_storage.bucket_name,
        Key=recording.key,
        Body=VIDEO_BYTES,
        ContentType="video/mp4",
    )

    original_url = f"http://localhost/media/{recording.key:s}"
    response = client.get(
        "/api/v1.0/recordings/retrieve-auth/", HTTP_X_ORIGINAL_URL=original_url
    )

    assert response.status_code == 403


@pytest.mark.parametrize("is_public", [True, False])
@pytest.mark.parametrize("role", models.RoleChoices.values)
def test_api_recordings_retrieve_auth_admin_or_owner(role, is_public):
    """
    Users who are administrator or owner of a room, should be able to retrieve recordings.
    """
    room = factories.RoomFactory(is_public=is_public)
    recording = room.start_recording()

    user = factories.UserFactory()
    client = APIClient()
    client.force_login(user)

    factories.UserResourceAccessFactory(resource=room, user=user, role=role)

    # deposit a recording in S3
    default_storage.connection.meta.client.put_object(
        Bucket=default_storage.bucket_name,
        Key=recording.key,
        Body=VIDEO_BYTES,
        ContentType="video/mp4",
    )

    # verify getting object content from url with authorization headers
    original_url = f"http://localhost/media/{recording.key:s}"
    response = client.get(
        "/api/v1.0/recordings/retrieve-auth/", HTTP_X_ORIGINAL_URL=original_url
    )

    assert response.status_code == 200

    authorization = response["Authorization"]
    assert "AWS4-HMAC-SHA256 Credential=" in authorization
    assert (
        "SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature="
        in authorization
    )
    assert response["X-Amz-Date"] == timezone.now().strftime("%Y%m%dT%H%M%SZ")

    s3_url = urlparse(settings.AWS_S3_ENDPOINT_URL)
    file_url = f"{settings.AWS_S3_ENDPOINT_URL:s}/meet-media-storage/{recording.key:s}"
    response = requests.get(
        file_url,
        headers={
            "authorization": authorization,
            "x-amz-date": response["x-amz-date"],
            "x-amz-content-sha256": response["x-amz-content-sha256"],
            "Host": f"{s3_url.hostname:s}:{s3_url.port:d}",
        },
        timeout=1,
    )

    assert response.content == VIDEO_BYTES
