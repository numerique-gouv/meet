"""
Unit tests for the RecordingAccess model
"""

from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError

import pytest

from core import factories

pytestmark = pytest.mark.django_db


def test_models_recording_accesses_str():
    """
    The str representation should include user email, recording ID and role.
    """
    user = factories.UserFactory(email="david.bowman@example.com")
    access = factories.UserRecordingAccessFactory(
        role="member",
        user=user,
    )
    assert (
        str(access)
        == f"david.bowman@example.com is member in Recording {access.recording.id} (initiated)"
    )


def test_models_recording_accesses_unique_user():
    """Recording accesses should be unique for a given couple of user and recording."""
    access = factories.UserRecordingAccessFactory()

    with pytest.raises(
        ValidationError,
        match="This user is already in this recording.",
    ):
        factories.UserRecordingAccessFactory(
            user=access.user, recording=access.recording
        )


def test_models_recording_accesses_several_empty_teams():
    """A recording can have several recording accesses with an empty team."""
    access = factories.UserRecordingAccessFactory()
    factories.UserRecordingAccessFactory(recording=access.recording)


def test_models_recording_accesses_unique_team():
    """Recording accesses should be unique for a given couple of team and recording."""
    access = factories.TeamRecordingAccessFactory()

    with pytest.raises(
        ValidationError,
        match="This team is already in this recording.",
    ):
        factories.TeamRecordingAccessFactory(
            team=access.team, recording=access.recording
        )


def test_models_recording_accesses_several_null_users():
    """A recording can have several recording accesses with a null user."""
    access = factories.TeamRecordingAccessFactory()
    factories.TeamRecordingAccessFactory(recording=access.recording)


def test_models_recording_accesses_user_and_team_set():
    """User and team can't both be set on a recording access."""
    with pytest.raises(
        ValidationError,
        match="Either user or team must be set, not both.",
    ):
        factories.UserRecordingAccessFactory(team="my-team")


def test_models_recording_accesses_user_and_team_empty():
    """User and team can't both be empty on a recording access."""
    with pytest.raises(
        ValidationError,
        match="Either user or team must be set, not both.",
    ):
        factories.UserRecordingAccessFactory(user=None)


# get_abilities


def test_models_recording_access_get_abilities_anonymous():
    """Check abilities returned for an anonymous user."""
    access = factories.UserRecordingAccessFactory()
    abilities = access.get_abilities(AnonymousUser())
    assert abilities == {
        "destroy": False,
        "retrieve": False,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


def test_models_recording_access_get_abilities_authenticated():
    """Check abilities returned for an authenticated user."""
    access = factories.UserRecordingAccessFactory()
    user = factories.UserFactory()
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": False,
        "retrieve": False,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


# - for owner


def test_models_recording_access_get_abilities_for_owner_of_self_allowed():
    """
    Check abilities of self access for the owner of a recording when
    there is more than one owner left.
    """
    access = factories.UserRecordingAccessFactory(role="owner")
    factories.UserRecordingAccessFactory(recording=access.recording, role="owner")
    abilities = access.get_abilities(access.user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["administrator", "member"],
    }


def test_models_recording_access_get_abilities_for_owner_of_self_last():
    """
    Check abilities of self access for the owner of a recording when there is only one owner left.
    """
    access = factories.UserRecordingAccessFactory(role="owner")
    abilities = access.get_abilities(access.user)
    assert abilities == {
        "destroy": False,
        "retrieve": True,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


def test_models_recording_access_get_abilities_for_owner_of_owner():
    """Check abilities of owner access for the owner of a recording."""
    access = factories.UserRecordingAccessFactory(role="owner")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="owner"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["administrator", "member"],
    }


def test_models_recording_access_get_abilities_for_owner_of_administrator():
    """Check abilities of administrator access for the owner of a recording."""
    access = factories.UserRecordingAccessFactory(role="administrator")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="owner"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["member", "owner"],
    }


def test_models_recording_access_get_abilities_for_owner_of_member():
    """Check abilities of member access for the owner of a recording."""
    access = factories.UserRecordingAccessFactory(role="member")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="owner"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["administrator", "owner"],
    }


# - for administrator


def test_models_recording_access_get_abilities_for_administrator_of_owner():
    """Check abilities of owner access for the administrator of a recording."""
    access = factories.UserRecordingAccessFactory(role="owner")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="administrator"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": False,
        "retrieve": True,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


def test_models_recording_access_get_abilities_for_administrator_of_administrator():
    """Check abilities of administrator access for the administrator of a recording."""
    access = factories.UserRecordingAccessFactory(role="administrator")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="administrator"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["member"],
    }


def test_models_recording_access_get_abilities_for_administrator_of_member():
    """Check abilities of member access for the administrator of a recording."""
    access = factories.UserRecordingAccessFactory(role="member")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="administrator"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": True,
        "retrieve": True,
        "update": True,
        "partial_update": True,
        "set_role_to": ["administrator"],
    }


# - for member


def test_models_recording_access_get_abilities_for_member_of_owner():
    """Check abilities of owner access for the member of a recording."""
    access = factories.UserRecordingAccessFactory(role="owner")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="member"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": False,
        "retrieve": True,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


def test_models_recording_access_get_abilities_for_member_of_administrator():
    """Check abilities of administrator access for the member of a recording."""
    access = factories.UserRecordingAccessFactory(role="administrator")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="member"
    ).user
    abilities = access.get_abilities(user)
    assert abilities == {
        "destroy": False,
        "retrieve": True,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }


def test_models_recording_access_get_abilities_for_member_of_member_user(
    django_assert_num_queries,
):
    """Check abilities of member access for the member of a recording."""
    access = factories.UserRecordingAccessFactory(role="member")
    factories.UserRecordingAccessFactory(recording=access.recording)  # another one
    user = factories.UserRecordingAccessFactory(
        recording=access.recording, role="member"
    ).user

    with django_assert_num_queries(1):
        abilities = access.get_abilities(user)

    assert abilities == {
        "destroy": False,
        "retrieve": True,
        "update": False,
        "partial_update": False,
        "set_role_to": [],
    }
