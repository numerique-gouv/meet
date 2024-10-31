"""
Unit tests for the Recording model
"""

from django.core.exceptions import ValidationError

import pytest

from core.factories import RecordingFactory, RoomFactory, UserFactory
from core.models import Recording, RecordingStatusChoices

pytestmark = pytest.mark.django_db


def test_models_recording_str():
    """The str representation should be the recording ID."""
    recording = RecordingFactory()
    assert str(recording) == str(recording.id)


def test_models_recording_ordering():
    """Recordings should be returned ordered by created_at in descending order."""
    RecordingFactory.create_batch(3)
    recordings = Recording.objects.all()
    assert recordings[0].created_at >= recordings[1].created_at
    assert recordings[1].created_at >= recordings[2].created_at


def test_models_recording_creator_relationship():
    """It should maintain proper relationship with creator."""
    user = UserFactory()
    recording = RecordingFactory(creator=user)
    assert recording.creator == user
    assert recording in user.recordings.all()


def test_models_recording_room_relationship():
    """It should maintain proper relationship with room."""
    room = RoomFactory()
    recording = RecordingFactory(room=room)
    assert recording.room == room
    assert recording in room.recordings.all()


def test_models_recording_default_status():
    """A new recording should have INITIATED status by default."""
    recording = RecordingFactory()
    assert recording.status == RecordingStatusChoices.INITIATED


def test_models_recording_unique_initiated_or_active_per_room():
    """Only one initiated or active recording should be allowed per room."""
    room = RoomFactory()
    RecordingFactory(room=room, status=RecordingStatusChoices.ACTIVE)

    with pytest.raises(ValidationError):
        RecordingFactory(room=room, status=RecordingStatusChoices.ACTIVE)

    with pytest.raises(ValidationError):
        RecordingFactory(room=room, status=RecordingStatusChoices.INITIATED)


def test_models_recording_multiple_finished_allowed():
    """Multiple finished recordings should be allowed in the same room."""
    room = RoomFactory()
    RecordingFactory(room=room, status=RecordingStatusChoices.SAVED)
    RecordingFactory(room=room, status=RecordingStatusChoices.SAVED)
    assert room.recordings.count() == 2


# Test get_abilities method
def test_models_recording_get_abilities_creator():
    """Test abilities for the recording creator."""
    recording = RecordingFactory(status=RecordingStatusChoices.ACTIVE)
    abilities = recording.get_abilities(recording.creator)

    assert abilities == {
        "destroy": False,  # Not final status
        "partial_update": False,
        "retrieve": True,  # Creator can always retrieve
        "stop": True,  # Not final status, so can stop
        "update": False,
    }


def test_models_recording_get_abilities_non_creator():
    """Test abilities for a user who isn't the creator."""
    recording = RecordingFactory()
    other_user = UserFactory()
    abilities = recording.get_abilities(other_user)

    assert abilities == {
        "destroy": False,
        "partial_update": False,
        "retrieve": False,
        "stop": False,
        "update": False,
    }


def test_models_recording_get_abilities_final_status():
    """Test abilities when recording is in final status."""
    recording = RecordingFactory(status=RecordingStatusChoices.SAVED)
    abilities = recording.get_abilities(recording.creator)

    assert abilities == {
        "destroy": True,  # Final status, creator can destroy
        "partial_update": False,
        "retrieve": True,
        "stop": False,  # Can't stop when in final status
        "update": False,
    }


# Test is_savable method
def test_models_recording_is_savable_normal():
    """Test is_savable for normal recording status."""
    recording = RecordingFactory(status=RecordingStatusChoices.ACTIVE)
    assert recording.is_savable() is True


@pytest.mark.parametrize(
    "status",
    [
        RecordingStatusChoices.FAILED_TO_STOP,
        RecordingStatusChoices.FAILED_TO_START,
        RecordingStatusChoices.ABORTED,
    ],
)
def test_models_recording_is_savable_error(status):
    """Test is_savable for error status."""
    recording = RecordingFactory(status=status)
    assert recording.is_savable() is False


def test_models_recording_is_savable_already_saved():
    """Test is_savable for already saved recording."""
    recording = RecordingFactory(status=RecordingStatusChoices.SAVED)
    assert recording.is_savable() is False


# Test few corner cases


def test_models_recording_worker_id_optional():
    """Worker ID should be optional."""
    recording = RecordingFactory(worker_id=None)
    assert recording.worker_id is None

    recording = RecordingFactory(worker_id="worker-123")
    assert recording.worker_id == "worker-123"


def test_models_recording_mode_required():
    """Recording mode should be required."""
    with pytest.raises(ValidationError):
        RecordingFactory(mode=None)


def test_models_recording_invalid_status():
    """Test that setting an invalid status raises an error."""
    recording = RecordingFactory()
    recording.status = "INVALID_STATUS"
    with pytest.raises(ValidationError):
        recording.save()


def test_models_recording_invalid_mode():
    """Test that setting an invalid mode raises an error."""
    with pytest.raises(ValidationError):
        RecordingFactory(mode="INVALID_MODE")


def test_models_recording_room_deletion():
    """Test that deleting a room cascades to its recordings."""
    room = RoomFactory()
    recording = RecordingFactory(room=room)
    room.delete()
    assert not Recording.objects.filter(id=recording.id).exists()


def test_models_recording_creator_deletion():
    """Test that deleting a creator cascades to their recordings."""
    creator = UserFactory()
    recording = RecordingFactory(creator=creator)
    creator.delete()
    assert not Recording.objects.filter(id=recording.id).exists()


def test_models_recording_worker_id_very_long():
    """Test worker_id with maximum length."""
    long_id = "w" * 255
    recording = RecordingFactory(worker_id=long_id)
    assert recording.worker_id == long_id

    too_long_id = "w" * 256
    with pytest.raises(ValidationError):
        RecordingFactory(worker_id=too_long_id)
