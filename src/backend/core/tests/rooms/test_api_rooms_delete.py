"""
Test rooms API endpoints in the Meet core app: delete.
"""
import pytest
from rest_framework.test import APIClient

from ...factories import RoomFactory, UserFactory
from ...models import Room

pytestmark = pytest.mark.django_db


def test_api_rooms_delete_anonymous():
    """Anonymous users should not be allowed to destroy a room."""
    room = RoomFactory()
    client = APIClient()

    response = client.delete(
        f"/api/v1.0/rooms/{room.id!s}/",
    )

    assert response.status_code == 401
    assert Room.objects.count() == 1


def test_api_rooms_delete_authenticated():
    """
    Authenticated users should not be allowed to delete a room to which they are not
    related.
    """
    room = RoomFactory()
    user = UserFactory()

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/rooms/{room.id!s}/",
    )

    assert response.status_code == 403
    assert Room.objects.count() == 1


def test_api_rooms_delete_members():
    """
    Authenticated users should not be allowed to delete a room for which they are
    only a member.
    """
    user = UserFactory()
    room = RoomFactory(
        users=[(user, "member")]
    )  # as user declared in the room but not administrator

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/rooms/{room.id}/",
    )

    assert response.status_code == 403
    assert Room.objects.count() == 1


def test_api_rooms_delete_administrators():
    """
    Authenticated users should not be allowed to delete a room for which they are
    administrator.
    """
    user = UserFactory()
    room = RoomFactory(users=[(user, "administrator")])

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/rooms/{room.id}/",
    )

    assert response.status_code == 403
    assert Room.objects.count() == 1


def test_api_rooms_delete_owners():
    """
    Authenticated users should be able to delete a room for which they are directly
    owner.
    """
    user = UserFactory()
    room = RoomFactory(users=[(user, "owner")])

    client = APIClient()
    client.force_login(user)

    response = client.delete(
        f"/api/v1.0/rooms/{room.id}/",
    )

    assert response.status_code == 204
    assert Room.objects.exists() is False
