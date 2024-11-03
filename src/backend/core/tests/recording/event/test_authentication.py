"""
Test event authentication.
"""

# pylint: disable=E1128

from django.test import RequestFactory, override_settings

import pytest
from rest_framework.exceptions import AuthenticationFailed

from core.recording.event.authentication import (
    StorageEventAuthentication,
)


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_successful_authentication():
    """Test successful authentication with valid token."""

    request = RequestFactory().get("/")
    request.headers = {"Authorization": "Bearer valid-test-token"}

    result = StorageEventAuthentication().authenticate(request)
    assert (
        result is None
    )  # Authentication successful but returns None as per implementation


@override_settings(RECORDING_STORAGE_EVENT_TOKEN=None)
@pytest.mark.parametrize("add_header", [True, False])
def test_disabled_authentication(add_header):
    """Test behavior when token is not configured in settings."""
    # mock_settings.RECORDING_STORAGE_EVENT_TOKEN = ''
    request = RequestFactory().get("/")
    if add_header:
        request.headers = {"Authorization": "Bearer some-token"}

    result = StorageEventAuthentication().authenticate(request)
    assert result is None


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_missing_auth_header():
    """Test failure when Authorization header is missing."""
    request = RequestFactory().get("/")
    request.headers = {}

    with pytest.raises(AuthenticationFailed, match="Authorization header is required"):
        StorageEventAuthentication().authenticate(request)


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_invalid_auth_header_format():
    """Test failure when Authorization header has invalid format."""
    request = RequestFactory().get("/")
    request.headers = {"Authorization": "InvalidFormat"}

    with pytest.raises(AuthenticationFailed, match="Invalid authorization header"):
        StorageEventAuthentication().authenticate(request)


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_invalid_token_type():
    """Test failure when token type is not Bearer."""
    request = RequestFactory().get("/")
    request.headers = {"Authorization": "Basic some-token"}

    with pytest.raises(AuthenticationFailed, match="Invalid authorization header"):
        StorageEventAuthentication().authenticate(request)


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_invalid_token():
    """Test failure when token is invalid."""
    request = RequestFactory().get("/")
    request.headers = {"Authorization": "Bearer wrong-token"}

    with pytest.raises(AuthenticationFailed, match="Invalid token"):
        StorageEventAuthentication().authenticate(request)


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_malformed_auth_header():
    """Test failure when Authorization header is malformed."""
    request = RequestFactory().get("/")
    request.headers = {"Authorization": "Bearer"}  # Missing token part

    with pytest.raises(AuthenticationFailed, match="Invalid authorization header"):
        StorageEventAuthentication().authenticate(request)


def test_authenticate_header():
    """Test the WWW-Authenticate header value."""
    request = RequestFactory().get("/")
    header = StorageEventAuthentication().authenticate_header(request)
    assert header == "Bearer realm='Storage event API'"


@override_settings(RECORDING_STORAGE_EVENT_TOKEN="valid-test-token")
def test_multiple_spaces_in_auth_header():
    """Test failure when Authorization header contains multiple spaces."""
    request = RequestFactory().get("/")
    request.headers = {"Authorization": "Bearer   extra-spaces-token"}

    with pytest.raises(AuthenticationFailed, match="Invalid authorization header"):
        StorageEventAuthentication().authenticate(request)
