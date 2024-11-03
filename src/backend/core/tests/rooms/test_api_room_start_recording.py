"""
Test rooms API endpoints in the Meet core app: start recording.
"""

# pylint: disable=W0621,W0613

from unittest import mock

from django.test.utils import override_settings

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from ...factories import RoomFactory, UserFactory
from ...models import Recording
from ...recording.worker.exceptions import RecordingStartError

pytestmark = pytest.mark.django_db


@pytest.fixture
def mock_worker_service():
    """Mock worker service."""
    return mock.Mock()


@pytest.fixture
def mock_worker_service_provider(mock_worker_service):
    """Mock worker service factory."""
    with mock.patch(
        "core.api.viewsets.worker_service_provider.create",
        return_value=mock_worker_service,
    ) as mock_worker_service_provider:
        yield mock_worker_service_provider


@pytest.fixture
def mock_worker_manager(mock_worker_service):
    """Mock worker service mediator."""
    with mock.patch("core.api.viewsets.WorkerServiceMediator") as mock_mediator_class:
        mock_mediator = mock.Mock()
        mock_mediator_class.return_value = mock_mediator
        yield mock_mediator


def test_start_recording_anonymous():
    """Anonymous users should not be allowed to start room recordings."""
    room = RoomFactory()
    client = APIClient()

    response = client.post(
        f"/api/v1.0/rooms/{room.id}/start-recording/", {"mode": "standard"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert Recording.objects.count() == 0


def test_start_recording_non_owner_and_non_administrator():
    """Non-owner and Non-Administrator users should not be allowed to start room recordings."""
    room = RoomFactory()
    user = UserFactory()
    client = APIClient()
    client.force_login(user)

    response = client.post(
        f"/api/v1.0/rooms/{room.id}/start-recording/", {"mode": "standard"}
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert Recording.objects.count() == 0


@override_settings(RECORDING_ENABLE=False)
def test_start_recording_recording_disabled():
    """Should fail if recording is disabled for the room."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    client = APIClient()
    client.force_login(user)

    response = client.post(
        f"/api/v1.0/rooms/{room.id}/start-recording/", {"mode": "standard"}
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": "Access denied, recording is disabled."}
    assert Recording.objects.count() == 0


@override_settings(RECORDING_ENABLE=True)
def test_start_recording_missing_mode():
    """Should fail if recording mode is not provided."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/start-recording/", {})

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert response.json() == {"error": "Recording mode is required."}
    assert Recording.objects.count() == 0


@override_settings(RECORDING_ENABLE=True)
def test_start_recording_worker_error(
    mock_worker_service_provider, mock_worker_manager
):
    """Should handle worker service errors appropriately."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    # Configure mock mediator to raise error
    mock_start = mock.Mock()
    mock_start.side_effect = RecordingStartError("Failed to connect to worker")

    mock_worker_manager.start = mock_start

    client = APIClient()
    client.force_login(user)

    response = client.post(
        f"/api/v1.0/rooms/{room.id}/start-recording/", {"mode": "screen_recording"}
    )

    mock_worker_service_provider.assert_called_once_with(mode="screen_recording")

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert response.json() == {
        "error": f"Recording failed to start for room {room.slug}"
    }

    # Recording object should be created even if worker fails
    assert Recording.objects.count() == 1
    recording = Recording.objects.first()
    assert recording.room == room
    assert recording.mode == "screen_recording"
    assert recording.creator == user


@override_settings(RECORDING_ENABLE=True)
def test_start_recording_success(mock_worker_service_provider, mock_worker_manager):
    """Should successfully start recording when everything is configured correctly."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    mock_start = mock.Mock()
    mock_worker_manager.start = mock_start

    client = APIClient()
    client.force_login(user)

    response = client.post(
        f"/api/v1.0/rooms/{room.id}/start-recording/", {"mode": "screen_recording"}
    )

    mock_worker_service_provider.assert_called_once_with(mode="screen_recording")

    assert response.status_code == status.HTTP_201_CREATED
    assert response.json() == {
        "message": f"Recording successfully started for room {room.slug}"
    }

    # Verify the mediator was called with the recording
    recording = Recording.objects.first()
    mock_start.assert_called_once_with(recording)
