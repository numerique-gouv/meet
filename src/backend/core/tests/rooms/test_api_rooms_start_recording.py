"""
Test rooms API endpoints in the Meet core app: start-recording.
"""

import pytest
from rest_framework.test import APIClient

from core import factories, models

pytestmark = pytest.mark.django_db


def test_api_rooms_start_recording_anonymous():
    """Anonymous users should not be allowed to start a recording for a room."""
    room = factories.RoomFactory()

    response = APIClient().post(f"/api/v1.0/rooms/{room.id!s}/start-recording/")

    assert response.status_code == 401
    assert models.Recording.objects.exists() is False


def test_api_rooms_start_recording_authenticated():
    """
    Authenticated users should not be allowed to start a recording for a room
    to which they are not related.
    """
    user = factories.UserFactory()
    room = factories.RoomFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id!s}/start-recording/")

    assert response.status_code == 403
    assert models.Recording.objects.exists() is False


def test_api_rooms_start_recording_members():
    """
    Users who are members of a room but not administrators should
    not be allowed to start a recording in this room.
    """
    user = factories.UserFactory()
    room = factories.RoomFactory(users=[(user, "member")])

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id!s}/start-recording/")

    assert response.status_code, 403
    assert models.Recording.objects.exists() is False


@pytest.mark.parametrize("role", ["administrator", "owner"])
def test_api_rooms_start_recording_administrators(role):
    """Administrators or owners of a room should be allowed to start a recording in this room."""
    user = factories.UserFactory()
    room = factories.RoomFactory(users=[(user, role)])

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id!s}/start-recording/")

    assert response.status_code == 201
    assert models.Recording.objects.get().room == room


@pytest.mark.parametrize("role", ["administrator", "owner"])
def test_api_rooms_start_recording_administrators_of_another(role):
    """
    Being administrator or owner of a room should not grant authorization
    to update another room.
    """
    user = factories.UserFactory()
    factories.RoomFactory(users=[(user, role)])
    other_room = factories.RoomFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{other_room.id!s}/start-recording/")

    assert response.status_code, 403
    assert models.Recording.objects.exists() is False
