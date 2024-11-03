"""
Test rooms API endpoints in the Meet core app: stop recording.
"""

# pylint: disable=W0621,W0613

from unittest import mock

from django.test.utils import override_settings

import pytest
from rest_framework import status
from rest_framework.test import APIClient

from ...factories import RecordingFactory, RoomFactory, UserFactory
from ...models import Recording, RecordingStatusChoices
from ...recording.worker.exceptions import RecordingStopError

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


def test_stop_recording_anonymous():
    """Anonymous users should not be allowed to stop room recordings."""
    room = RoomFactory()
    RecordingFactory(room=room, status=RecordingStatusChoices.ACTIVE)
    client = APIClient()

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    # Verify recording status hasn't changed
    assert Recording.objects.filter(status=RecordingStatusChoices.ACTIVE).count() == 1


def test_stop_recording_non_owner_and_non_administrator():
    """Non-owner and Non-Administrator users should not be allowed to stop room recordings."""
    room = RoomFactory()
    user = UserFactory()
    RecordingFactory(room=room, status=RecordingStatusChoices.ACTIVE)
    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    assert response.status_code == status.HTTP_403_FORBIDDEN
    # Verify recording status hasn't changed
    assert Recording.objects.filter(status=RecordingStatusChoices.ACTIVE).count() == 1


@override_settings(RECORDING_ENABLE=False)
def test_stop_recording_recording_disabled():
    """Should fail if recording is disabled for the room."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": "Access denied, recording is disabled."}
    # Verify no recording exists
    assert Recording.objects.count() == 0


@override_settings(RECORDING_ENABLE=True)
def test_stop_recording_no_active_recording():
    """Should fail when there is no active recording for the room."""
    room = RoomFactory()
    user = UserFactory()
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "No active recording found for this room."}


@override_settings(RECORDING_ENABLE=True)
def test_stop_recording_worker_error(mock_worker_service_provider, mock_worker_manager):
    """Should handle worker service errors appropriately."""
    room = RoomFactory()
    user = UserFactory()
    recording = RecordingFactory(
        room=room, status=RecordingStatusChoices.ACTIVE, mode="screen_recording"
    )
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    # Configure mock mediator to raise error
    mock_stop = mock.Mock()
    mock_stop.side_effect = RecordingStopError("Failed to connect to worker")
    mock_worker_manager.stop = mock_stop

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    mock_worker_service_provider.assert_called_once_with(mode="screen_recording")
    mock_stop.assert_called_once_with(recording)

    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert response.json() == {
        "error": f"Recording failed to stop for room {room.slug}"
    }
    # Verify recording status hasn't changed
    assert Recording.objects.filter(status=RecordingStatusChoices.ACTIVE).count() == 1


@override_settings(RECORDING_ENABLE=True)
def test_stop_recording_success(mock_worker_service_provider, mock_worker_manager):
    """Should successfully stop recording when everything is configured correctly."""
    room = RoomFactory()
    user = UserFactory()
    recording = RecordingFactory(
        room=room, status=RecordingStatusChoices.ACTIVE, mode="screen_recording"
    )
    # Make user the room owner
    room.accesses.create(user=user, role="owner")

    mock_stop = mock.Mock()
    mock_worker_manager.stop = mock_stop

    client = APIClient()
    client.force_login(user)

    response = client.post(f"/api/v1.0/rooms/{room.id}/stop-recording/")

    mock_worker_service_provider.assert_called_once_with(mode="screen_recording")
    mock_stop.assert_called_once_with(recording)

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == {"message": f"Recording stopped for room {room.slug}."}

    # Verify the recording still exists
    assert Recording.objects.count() == 1
