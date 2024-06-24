"""
Unit tests for the ResourceAccess model with user
"""
from django.core.exceptions import ValidationError

import pytest

from core.factories import RoomFactory, UserResourceAccessFactory

pytestmark = pytest.mark.django_db


def test_models_resource_accesses_user_str_member_room():
    """The str representation should consist in the room and usernames."""
    room = RoomFactory(name="my room")
    access = UserResourceAccessFactory(
        resource=room, user__email="john.doe@impress.com", role="member"
    )
    assert str(access) == "Member role for john.doe@impress.com on my room"


def test_models_resource_accesses_user_str_member_resource():
    """The str representation should consist in the resource id and username."""
    access = UserResourceAccessFactory(
        user__email="john.doe@impress.com", role="member"
    )
    assert (
        str(access)
        == f"Member role for john.doe@impress.com on resource {access.resource_id!s}"
    )


def test_models_resource_accesses_user_str_admin():
    """The str representation for an admin user should include the role."""
    access = UserResourceAccessFactory(
        user__email="john.doe@impress.com", role="administrator"
    )

    assert (
        str(access)
        == f"Administrator role for john.doe@impress.com on resource {access.resource_id!s}"
    )


def test_models_resource_accesses_user_str_owner():
    """The str representation for an admin user should include the role."""
    access = UserResourceAccessFactory(user__email="john.doe@impress.com", role="owner")
    assert (
        str(access)
        == f"Owner role for john.doe@impress.com on resource {access.resource_id!s}"
    )


def test_models_resource_accesses_user_unique():
    """Room user accesses should be unique."""
    access = UserResourceAccessFactory()

    with pytest.raises(ValidationError) as excinfo:
        UserResourceAccessFactory(user=access.user, resource=access.resource)

    assert "Resource access with this User and Resource already exists." in str(
        excinfo.value
    )
