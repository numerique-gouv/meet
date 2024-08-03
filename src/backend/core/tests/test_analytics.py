"""
Test for the Analytics class.
"""

# pylint: disable=W0212

from unittest.mock import patch

from django.contrib.auth.models import AnonymousUser
from django.test.utils import override_settings

import pytest

from core.analytics import Analytics
from core.factories import UserFactory

pytestmark = pytest.mark.django_db


@pytest.fixture(name="mock_june_analytics")
def _mock_june_analytics():
    with patch("core.analytics.jAnalytics") as mock:
        yield mock


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_init_enabled(mock_june_analytics):
    """Should enable analytics and set the write key correctly when ANALYTICS_KEY is set."""
    analytics = Analytics()
    assert analytics._enabled is True
    assert mock_june_analytics.write_key == "test_key"


@override_settings(ANALYTICS_KEY=None)
def test_analytics_init_disabled():
    """Should disable analytics when ANALYTICS_KEY is not set."""
    analytics = Analytics()
    assert analytics._enabled is False


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_identify_user(mock_june_analytics):
    """Should identify a user with the correct traits when analytics is enabled."""
    user = UserFactory(sub="12345", email="user@example.com")
    analytics = Analytics()
    analytics.identify(user)
    mock_june_analytics.identify.assert_called_once_with(
        user_id="12345", traits={"email": "***@example.com"}
    )


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_identify_user_with_traits(mock_june_analytics):
    """Should identify a user with additional traits when analytics is enabled."""
    user = UserFactory(sub="12345", email="user@example.com")
    analytics = Analytics()
    analytics.identify(user, traits={"email": "user@example.com", "foo": "foo"})
    mock_june_analytics.identify.assert_called_once_with(
        user_id="12345", traits={"email": "***@example.com", "foo": "foo"}
    )


@override_settings(ANALYTICS_KEY=None)
def test_analytics_identify_not_enabled(mock_june_analytics):
    """Should not call identify when analytics is not enabled."""
    user = UserFactory(sub="12345", email="user@example.com")
    analytics = Analytics()
    analytics.identify(user)
    mock_june_analytics.identify.assert_not_called()


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_identify_no_user(mock_june_analytics):
    """Should not call identify when the user is None."""
    analytics = Analytics()
    analytics.identify(None)
    mock_june_analytics.identify.assert_not_called()


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_identify_anonymous_user(mock_june_analytics):
    """Should not call identify when the user is anonymous."""
    user = AnonymousUser()
    analytics = Analytics()
    analytics.identify(user)
    mock_june_analytics.identify.assert_not_called()


@override_settings(ANALYTICS_KEY="test_key")
def test_analytics_track_event(mock_june_analytics):
    """Should track an event with the correct user and event details when analytics is enabled."""
    user = UserFactory(sub="12345")
    analytics = Analytics()
    analytics.track(user, event="test_event", foo="foo")
    mock_june_analytics.track.assert_called_once_with(
        user_id="12345", event="test_event", foo="foo"
    )


@override_settings(ANALYTICS_KEY=None)
def test_analytics_track_event_not_enabled(mock_june_analytics):
    """Should not call track when analytics is not enabled."""
    user = UserFactory(sub="12345")
    analytics = Analytics()
    analytics.track(user, event="test_event", foo="foo")

    mock_june_analytics.track.assert_not_called()


@override_settings(ANALYTICS_KEY="test_key")
@patch("uuid.uuid4", return_value="test_uuid4")
def test_analytics_track_event_no_user(mock_uuid4, mock_june_analytics):
    """Should track an event with a random anonymous user ID when the user is None."""
    analytics = Analytics()
    analytics.track(None, event="test_event", foo="foo")
    mock_june_analytics.track.assert_called_once_with(
        anonymous_id="test_uuid4", event="test_event", foo="foo"
    )
    mock_uuid4.assert_called_once()


@override_settings(ANALYTICS_KEY="test_key")
@patch("uuid.uuid4", return_value="test_uuid4")
def test_analytics_track_event_anonymous_user(mock_uuid4, mock_june_analytics):
    """Should track an event with a random anonymous user ID when the user is anonymous."""
    user = AnonymousUser()
    analytics = Analytics()
    analytics.track(user, event="test_event", foo="foo")
    mock_june_analytics.track.assert_called_once_with(
        anonymous_id="test_uuid4", event="test_event", foo="foo"
    )
    mock_uuid4.assert_called_once()
