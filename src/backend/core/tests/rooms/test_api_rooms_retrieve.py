"""
Test rooms API endpoints in the impress core app: retrieve.
"""
import random

from django.test.utils import override_settings

import pytest
from rest_framework.test import APIClient

from ...factories import RoomFactory, UserFactory, UserResourceAccessFactory

pytestmark = pytest.mark.django_db


def test_api_rooms_retrieve_anonymous_private_pk():
    """
    Anonymous users should be allowed to retrieve a private room but should not be
    given any token.
    """
    room = RoomFactory(is_public=False)
    client = APIClient()
    response = client.get(f"/api/v1.0/rooms/{room.id!s}/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": False,
        "name": room.name,
        "slug": room.slug,
    }


def test_api_rooms_retrieve_anonymous_private_pk_no_dashes():
    """It should be possible to get a room by its id stripped of its dashes."""
    room = RoomFactory(is_public=False)
    id_no_dashes = str(room.id).replace("-", "")

    client = APIClient()
    response = client.get(f"/api/v1.0/rooms/{id_no_dashes:s}/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": False,
        "name": room.name,
        "slug": room.slug,
    }


def test_api_rooms_retrieve_anonymous_private_slug():
    """It should be possible to get a room by its slug."""
    room = RoomFactory(is_public=False)
    client = APIClient()
    response = client.get(f"/api/v1.0/rooms/{room.slug!s}/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": False,
        "name": room.name,
        "slug": room.slug,
    }


def test_api_rooms_retrieve_anonymous_private_slug_not_normalized():
    """Getting a room by a slug that is not normalized should work."""
    room = RoomFactory(name="Réunion", is_public=False)
    client = APIClient()
    response = client.get("/api/v1.0/rooms/Réunion/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": False,
        "name": room.name,
        "slug": room.slug,
    }


@override_settings(ALLOW_UNREGISTERED_ROOMS=True)
def test_api_rooms_retrieve_anonymous_unregistered_allowed():
    """
    Retrieving an unregistered room should return a Livekit token
    if unregistered rooms are allowed.
    """
    client = APIClient()
    response = client.get("/api/v1.0/rooms/unregistered-room/")

    assert response.status_code == 200
    assert response.json() == {
        "id": None,
        "livekit": {
            "room": "unregistered-room",
            "token": "foo",
        },
    }

    # todo - assert generate_token has been called


@override_settings(ALLOW_UNREGISTERED_ROOMS=True)
def test_api_rooms_retrieve_anonymous_unregistered_allowed_not_normalized():
    """
    Getting an unregistered room by a slug that is not normalized should work
    and use the Livekit room on the url-safe name.
    """
    client = APIClient()
    response = client.get("/api/v1.0/rooms/Réunion/")

    assert response.status_code == 200
    assert response.json() == {
        "id": None,
        "livekit": {
            "room": "reunion",
            "token": "foo",
        },
    }

    # todo - assert generate_token has been called


@override_settings(ALLOW_UNREGISTERED_ROOMS=False)
def test_api_rooms_retrieve_anonymous_unregistered_not_allowed():
    """
    Retrieving an unregistered room should return a 404 if unregistered rooms are not allowed.
    """
    client = APIClient()
    response = client.get("/api/v1.0/rooms/unregistered-room/")

    assert response.status_code == 404
    assert response.json() == {"detail": "Not found."}


def test_api_rooms_retrieve_anonymous_public():
    """
    Anonymous users should be able to retrieve a room with a token provided it is public.
    """
    room = RoomFactory(is_public=True)
    client = APIClient()
    response = client.get(f"/api/v1.0/rooms/{room.id!s}/")

    assert response.status_code == 200
    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": True,
        "livekit": {
            "room": "foo",
            "token": "foo",
        },
        "name": room.name,
        "slug": room.slug,
    }

    # todo - assert generate_token has been called


def test_api_rooms_retrieve_authenticated_public():
    """
    Authenticated users should be allowed to retrieve a room and get a token for a room to
    which they are not related, provided the room is public.
    They should not see related users.
    """
    room = RoomFactory(is_public=True)

    user = UserFactory()
    client = APIClient()
    client.force_login(user)

    response = client.get(
        f"/api/v1.0/rooms/{room.id!s}/",
    )
    assert response.status_code == 200

    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": True,
        "livekit": {
            "room": "foo",
            "token": "foo",
        },
        "name": room.name,
        "slug": room.slug,
    }

    # todo - assert generate_token has been called


def test_api_rooms_retrieve_authenticated():
    """
    Authenticated users should be allowed to retrieve a private room to which they
    are not related but should not be given any token.
    """
    room = RoomFactory(is_public=False)

    user = UserFactory()
    client = APIClient()
    client.force_login(user)

    response = client.get(
        f"/api/v1.0/rooms/{room.id!s}/",
    )
    assert response.status_code == 200

    assert response.json() == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": False,
        "name": room.name,
        "slug": room.slug,
    }


def test_api_rooms_retrieve_members(django_assert_num_queries):
    """
    Users who are members of a room should be allowed to see related users.
    """
    user = UserFactory()
    other_user = UserFactory()

    room = RoomFactory()
    user_access = UserResourceAccessFactory(resource=room, user=user, role="member")
    other_user_access = UserResourceAccessFactory(
        resource=room, user=other_user, role="member"
    )

    client = APIClient()
    client.force_login(user)

    with django_assert_num_queries(4):
        response = client.get(
            f"/api/v1.0/rooms/{room.id!s}/",
        )

    assert response.status_code == 200
    content_dict = response.json()

    assert sorted(content_dict.pop("accesses"), key=lambda x: x["id"]) == sorted(
        [
            {
                "id": str(user_access.id),
                "user": {
                    "id": str(user_access.user.id),
                    "email": user_access.user.email,
                },
                "resource": str(room.id),
                "role": user_access.role,
            },
            {
                "id": str(other_user_access.id),
                "user": {
                    "id": str(other_user_access.user.id),
                    "email": other_user_access.user.email,
                },
                "resource": str(room.id),
                "role": other_user_access.role,
            },
        ],
        key=lambda x: x["id"],
    )

    assert content_dict == {
        "id": str(room.id),
        "is_administrable": False,
        "is_public": room.is_public,
        "livekit": {
            "room": "foo",
            "token": "foo",
        },
        "name": room.name,
        "slug": room.slug,
    }

    # todo - assert generate_token has been called


def test_api_rooms_retrieve_administrators(django_assert_num_queries):
    """
    A user who is an administrator or owner of a room should be allowed
    to see related users.
    """
    user = UserFactory()
    other_user = UserFactory()
    room = RoomFactory()
    user_access = UserResourceAccessFactory(
        resource=room, user=user, role=random.choice(["administrator", "owner"])
    )
    other_user_access = UserResourceAccessFactory(
        resource=room, user=other_user, role="member"
    )
    client = APIClient()
    client.force_login(user)

    with django_assert_num_queries(4):
        response = client.get(
            f"/api/v1.0/rooms/{room.id!s}/",
        )
    assert response.status_code == 200
    content_dict = response.json()

    assert sorted(content_dict.pop("accesses"), key=lambda x: x["id"]) == sorted(
        [
            {
                "id": str(other_user_access.id),
                "user": {
                    "id": str(other_user_access.user.id),
                    "email": other_user_access.user.email,
                },
                "resource": str(room.id),
                "role": other_user_access.role,
            },
            {
                "id": str(user_access.id),
                "user": {
                    "id": str(user_access.user.id),
                    "email": user_access.user.email,
                },
                "resource": str(room.id),
                "role": user_access.role,
            },
        ],
        key=lambda x: x["id"],
    )

    assert content_dict == {
        "id": str(room.id),
        "is_administrable": True,
        "is_public": room.is_public,
        "configuration": {},
        "livekit": {
            "room": "foo",
            "token": "foo",
        },
        "name": room.name,
        "slug": room.slug,
    }

    # todo - assert generate_token has been called
