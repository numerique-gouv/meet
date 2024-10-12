"""
Test recordings API endpoints in the Meet core app: stop.
"""

from datetime import datetime, timezone
from unittest import mock
from uuid import uuid4

from django.utils import timezone as django_timezone

import pytest
from rest_framework.test import APIClient

from core import factories

pytestmark = pytest.mark.django_db


def test_api_recording_stop_recording_success():
    """Anonymous users can stop a recording just with its UUID."""
    recording = factories.RecordingFactory()

    now = datetime(2010, 1, 1, tzinfo=timezone.utc)
    with mock.patch.object(django_timezone, "now", return_value=now):
        response = APIClient().post(f"/api/v1.0/recordings/{recording.id!s}/stop/")

    assert response.status_code == 200
    recording.refresh_from_db()
    assert recording.stopped_at == now


def test_api_recording_stop_recording_unknown():
    """Trying to stop an unknown recording should return a 404."""
    response = APIClient().post(f"/api/v1.0/recordings/{uuid4()!s}/stop/")

    assert response.status_code == 404


def test_api_recording_stop_recording_already_stopped():
    """
    Trying to stop a recording that was already stopped should return a 403 and leave
    the recording unmodified.
    """
    recording = factories.RecordingFactory()

    response = APIClient().post(f"/api/v1.0/recordings/{recording.id!s}/stop/")

    assert response.status_code == 200
    recording.refresh_from_db()
    stopped_at = recording.stopped_at

    response = APIClient().post(f"/api/v1.0/recordings/{recording.id!s}/stop/")

    assert response.status_code == 403
    recording.refresh_from_db()
    assert recording.stopped_at == stopped_at
