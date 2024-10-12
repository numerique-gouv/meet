"""
Test recordings API endpoints in the Meet core app: delete.
"""

import pytest
from rest_framework.test import APIClient

from ...factories import RecordingFactory, UserFactory
from ...models import Recording

pytestmark = pytest.mark.django_db


def test_api_recordings_delete_anonymous():
    """Anonymous users should not be allowed to destroy a recording."""
    recording = RecordingFactory()
    client = APIClient()

    response = client.delete(
        f"/api/v1.0/recordings/{recording.id!s}/",
    )

    assert response.status_code == 401
    assert Recording.objects.count() == 1


def test_api_recordings_delete_authenticated():
    """
    Authenticated users should not be allowed to delete a recording from a room to which
    they are not related.
    """
    recording = RecordingFactory()
    user = UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/recordings/{recording.id!s}/",
    )

    assert response.status_code == 403
    assert Recording.objects.count() == 1


def test_api_recordings_delete_members():
    """
    Authenticated users should not be allowed to delete a recording from a room of which
    they are only a member.
    """
    user = UserFactory()
    recording = RecordingFactory(
        room__users=[(user, "member")]
    )  # as user declared in the room but not administrator

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/recordings/{recording.id}/",
    )

    assert response.status_code == 403
    assert Recording.objects.count() == 1


def test_api_recordings_delete_administrators():
    """
    Authenticated users should not be allowed to delete a recording from a room in which
    they are administrator.
    """
    user = UserFactory()
    recording = RecordingFactory(room__users=[(user, "administrator")])

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/recordings/{recording.id}/",
    )

    assert response.status_code == 403
    assert Recording.objects.count() == 1


def test_api_recordings_delete_owners():
    """
    Authenticated users should be able to delete a recording from a room in which they are
    directly owner.
    """
    user = UserFactory()
    recording = RecordingFactory(room__users=[(user, "owner")])

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/recordings/{recording.id}/",
    )

    assert response.status_code == 204
    assert Recording.objects.exists() is False
