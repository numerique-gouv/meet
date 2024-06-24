"""
Test rooms API endpoints in the impress core app: create.
"""
import pytest
from rest_framework.test import APIClient

from ...factories import RoomFactory, UserFactory
from ...models import Room

pytestmark = pytest.mark.django_db


def test_api_rooms_create_anonymous():
    """Anonymous users should not be allowed to create rooms."""
    client = APIClient()

    response = client.post(
        "/api/v1.0/rooms/",
        {
            "name": "my room",
        },
    )

    assert response.status_code == 401
    assert Room.objects.exists() is False


def test_api_rooms_create_authenticated():
    """
    Authenticated users should be able to create rooms and should automatically be declared
    as owner of the newly created room.
    """
    user = UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/rooms/",
        {
            "name": "my room",
        },
    )

    assert response.status_code == 201
    room = Room.objects.get()
    assert room.name == "my room"
    assert room.slug == "my-room"
    assert room.accesses.filter(role="owner", user=user).exists() is True


def test_api_rooms_create_authenticated_existing_slug():
    """
    A user trying to create a room with a name that translates to a slug that already exists
    should receive a 400 error.
    """
    RoomFactory(name="my room")
    user = UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.post(
        "/api/v1.0/rooms/",
        {
            "name": "My Room!",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"slug": ["Room with this Slug already exists."]}
