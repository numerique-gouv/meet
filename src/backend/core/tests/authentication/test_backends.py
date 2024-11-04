"""Unit tests for the Authentication Backends."""

from django.core.exceptions import SuspiciousOperation

import pytest

from core import models
from core.authentication.backends import OIDCAuthenticationBackend
from core.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_authentication_getter_existing_user(monkeypatch):
    """
    If an existing user matches, the user should be returned.
    """

    klass = OIDCAuthenticationBackend()
    db_user = UserFactory(email="foo@mail.com")

    def get_userinfo_mocked(*args):
        return {"sub": db_user.sub, "email": "some@mail.com"}

    def get_existing_user(*args):
        return db_user

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)
    monkeypatch.setattr(
        OIDCAuthenticationBackend, "get_existing_user", get_existing_user
    )

    user = klass.get_or_create_user(
        access_token="test-token", id_token=None, payload=None
    )

    assert user == db_user


def test_authentication_getter_new_user_no_email(monkeypatch):
    """
    If no user matches, a user should be created.
    User's info doesn't contain an email, created user's email should be empty.
    """
    klass = OIDCAuthenticationBackend()

    def get_userinfo_mocked(*args):
        return {"sub": "123"}

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    user = klass.get_or_create_user(
        access_token="test-token", id_token=None, payload=None
    )

    assert user.sub == "123"
    assert user.email is None
    assert user.password == "!"
    assert models.User.objects.count() == 1


def test_authentication_getter_new_user_with_email(monkeypatch):
    """
    If no user matches, a user should be created.
    User's email and name should be set on the identity.
    The "email" field on the User model should not be set as it is reserved for staff users.
    """
    klass = OIDCAuthenticationBackend()

    email = "meet@example.com"

    def get_userinfo_mocked(*args):
        return {"sub": "123", "email": email, "first_name": "John", "last_name": "Doe"}

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    user = klass.get_or_create_user(
        access_token="test-token", id_token=None, payload=None
    )

    assert user.sub == "123"
    assert user.email == email
    assert user.password == "!"
    assert models.User.objects.count() == 1


def test_models_oidc_user_getter_invalid_token(django_assert_num_queries, monkeypatch):
    """The user's info doesn't contain a sub."""
    klass = OIDCAuthenticationBackend()

    def get_userinfo_mocked(*args):
        return {
            "test": "123",
        }

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    with (
        django_assert_num_queries(0),
        pytest.raises(
            SuspiciousOperation,
            match="User info contained no recognizable user identification",
        ),
    ):
        klass.get_or_create_user(access_token="test-token", id_token=None, payload=None)

    assert models.User.objects.exists() is False


def test_models_oidc_user_getter_empty_sub(django_assert_num_queries, monkeypatch):
    """The user's info contains a sub, but it's an empty string."""
    klass = OIDCAuthenticationBackend()

    def get_userinfo_mocked(*args):
        return {"test": "123", "sub": ""}

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    with (
        django_assert_num_queries(0),
        pytest.raises(
            SuspiciousOperation,
            match="User info contained no recognizable user identification",
        ),
    ):
        klass.get_or_create_user(access_token="test-token", id_token=None, payload=None)

    assert models.User.objects.exists() is False


def test_authentication_get_inactive_user(monkeypatch):
    """Test an exception is raised when attempting to authenticate inactive user."""

    klass = OIDCAuthenticationBackend()
    db_user = UserFactory(is_active=False)

    def get_userinfo_mocked(*args):
        return {"sub": db_user.sub}

    monkeypatch.setattr(OIDCAuthenticationBackend, "get_userinfo", get_userinfo_mocked)

    with (
        pytest.raises(
            SuspiciousOperation,
            match="User account is disabled",
        ),
    ):
        klass.get_or_create_user(access_token="test-token", id_token=None, payload=None)


def test_finds_user_by_sub(django_assert_num_queries):
    """Should return user when found by sub, and email is matching."""

    klass = OIDCAuthenticationBackend()
    db_user = UserFactory(email="foo@mail.com")

    with django_assert_num_queries(1):
        user = klass.get_existing_user(db_user.sub, db_user.email)

    assert user == db_user


def test_finds_user_when_email_fallback_disabled(django_assert_num_queries, settings):
    """Should not return a user when not found by sub, and email fallback is disabled."""

    settings.OIDC_FALLBACK_TO_EMAIL_FOR_IDENTIFICATION = False

    klass = OIDCAuthenticationBackend()
    db_user = UserFactory(email="foo@mail.com")

    with django_assert_num_queries(1):
        user = klass.get_existing_user("wrong-sub", db_user.email)

    assert user is None


def test_finds_user_when_email_is_none(django_assert_num_queries, settings):
    """Should not return a user when not found by sub, and email is empty."""

    settings.OIDC_FALLBACK_TO_EMAIL_FOR_IDENTIFICATION = True

    klass = OIDCAuthenticationBackend()
    UserFactory(email="foo@mail.com")

    empty_email = ""

    with django_assert_num_queries(1):
        user = klass.get_existing_user("wrong-sub", empty_email)

    assert user is None


def test_finds_user_by_email(django_assert_num_queries, settings):
    """Should return user when found by email, and sub is not matching."""

    settings.OIDC_FALLBACK_TO_EMAIL_FOR_IDENTIFICATION = True

    klass = OIDCAuthenticationBackend()
    db_user = UserFactory(email="foo@mail.com")

    with django_assert_num_queries(2):
        user = klass.get_existing_user("wrong-sub", db_user.email)

    assert user == db_user
