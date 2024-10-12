"""
Unit tests for the Room model
"""

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError

import pytest

from core.factories import RoomFactory, UserFactory
from core.models import Room

pytestmark = pytest.mark.django_db


def test_models_rooms_str():
    """The str representation should be the name."""
    room = RoomFactory()
    assert str(room) == room.name


def test_models_rooms_ordering():
    """Rooms should be returned ordered by name."""
    RoomFactory.create_batch(3)
    rooms = Room.objects.all()
    # Remove hyphens because postgresql is ignoring them when they sort
    assert rooms[1].name.replace("-", "") >= rooms[0].name.replace("-", "")
    assert rooms[2].name.replace("-", "") >= rooms[1].name.replace("-", "")


def test_models_rooms_name_maxlength():
    """The name field should be less than 100 characters."""
    RoomFactory(name="a" * 100)

    with pytest.raises(ValidationError) as excinfo:
        RoomFactory(name="a" * 101)

    assert "Ensure this value has at most 100 characters (it has 101)." in str(
        excinfo.value
    )


def test_models_rooms_slug_unique():
    """Room slugs should be unique."""
    RoomFactory(name="a room!")

    with pytest.raises(ValidationError) as excinfo:
        RoomFactory(name="A Room!")

    assert "Room with this Slug already exists." in str(excinfo.value)


def test_models_rooms_name_slug_like_uuid():
    """
    It should raise an error if the value of the name field leads to a slug looking
    like a UUID . We need unicity on the union of the `id` and `slug` fields.
    """
    with pytest.raises(ValidationError) as excinfo:
        RoomFactory(name="918689fb-038e 4e81-bf09 efd5902c5f0b")

    assert 'Room name "918689fb-038e 4e81-bf09 efd5902c5f0b" is reserved.' in str(
        excinfo.value
    )


def test_models_rooms_slug_automatic():
    """Room slugs should be automatically populated upon saving."""
    room = Room(name="Eléphant in the room")
    room.save()
    assert room.slug == "elephant-in-the-room"


def test_models_rooms_users():
    """It should be possible to attach users to a room."""
    room = RoomFactory()
    user = UserFactory()
    room.users.add(user)
    room.refresh_from_db()

    assert list(room.users.all()) == [user]


def test_models_rooms_is_public_default():
    """A room should be public by default."""
    room = Room.objects.create(name="room")
    assert room.is_public is True


def test_models_recordings_key():
    """Check the room key format."""
    room = RoomFactory()
    recording = room.start_recording()
    assert recording.key == f"recordings/{recording.pk!s}/file.mp4/"


# Access rights methods


def test_models_rooms_access_rights_none(django_assert_num_queries):
    """The `get_roles` method should return an empty list when called with None."""
    room = RoomFactory()

    with django_assert_num_queries(0):
        assert not list(room.get_roles(None))


def test_models_rooms_access_rights_anonymous(django_assert_num_queries):
    """The `get_roles` method should return an empty list for an anonymous user."""
    user = AnonymousUser()
    room = RoomFactory()

    with django_assert_num_queries(0):
        assert not list(room.get_roles(user))


def test_models_rooms_access_rights_authenticated(django_assert_num_queries):
    """
    The `get_roles` method should return an empty list for a user not related to the room.
    """
    user = UserFactory()
    room = RoomFactory()

    with django_assert_num_queries(1):
        assert not list(room.get_roles(user))


def test_models_rooms_access_rights_member_direct(django_assert_num_queries):
    """Check `get_roles` method on the room object for a direct member."""
    user = UserFactory()
    room = RoomFactory(users=[(user, "member")])

    with django_assert_num_queries(1):
        assert list(room.get_roles(user)) == ["member"]


def test_models_rooms_access_rights_administrator_direct(django_assert_num_queries):
    """Check `get_roles` method on the room object for a direct administrator."""
    user = UserFactory()
    room = RoomFactory(users=[(user, "administrator")])

    with django_assert_num_queries(1):
        assert list(room.get_roles(user)) == ["administrator"]


def test_models_rooms_access_rights_owner_direct(django_assert_num_queries):
    """Check `get_roles` method on the room object for an owner."""
    user = UserFactory()
    room = RoomFactory(users=[(user, "owner")])

    with django_assert_num_queries(1):
        assert list(room.get_roles(user)) == ["owner"]
