"""Mediator between the worker service and recording instances in the Django ORM."""

import logging

from core.models import Recording, RecordingStatusChoices

from .exceptions import (
    RecordingStartError,
    RecordingStopError,
    WorkerConnectionError,
    WorkerRequestError,
    WorkerResponseError,
)
from .factories import WorkerService

logger = logging.getLogger(__name__)


class WorkerServiceMediator:
    """Mediate interactions between a worker service and a recording instance.

    This class avoids direct coupling between the worker service and the Django ORM.
    It is responsible for updating the recording instance based on the worker service's
    status and responses. It also encapsulates worker-related errors into more
    user-friendly higher-level exceptions.

    This class follows the Mediator design pattern to centralize and coordinate
    the communication between the worker service and the recording instances. It's not only
    a facade for the worker service, because it adds functionalities to the worker service.
    """

    def __init__(self, worker_service: WorkerService):
        """Initialize the WorkerServiceMediator with the provided worker service."""

        self._worker_service = worker_service

    def start(self, recording: Recording):
        """Start the recording process using the worker service.

        Args:
            recording (Recording): The recording instance to start.

        Raises:
            RecordingStartError: If there is an error starting the recording.
        """

        # FIXME - no manipulations of room_name should be required
        room_name = f"{recording.room.id!s}".replace("-", "")

        try:
            worker_id = self._worker_service.start(room_name, recording.id)
        except (WorkerRequestError, WorkerConnectionError, WorkerResponseError) as e:
            logger.error(
                "Failed to start recording for room %s: %s", recording.room.slug, e
            )
            recording.status = RecordingStatusChoices.FAILED_TO_START
            raise RecordingStartError() from e
        else:
            recording.worker_id = worker_id
            recording.status = RecordingStatusChoices.ACTIVE
        finally:
            recording.save()

        logger.info(
            "Worker started for room %s (worker ID: %s, mode: %s)",
            recording.room,
            recording.worker_id,
            recording.mode,
        )

    def stop(self, recording: Recording):
        """Stop the recording process using the worker service.

        Args:
            recording (Recording): The recording instance to stop.

        Raises:
            RecordingStopError: If there is an error stopping the recording.
        """

        try:
            response = self._worker_service.stop(worker_id=recording.worker_id)
        except (WorkerConnectionError, WorkerResponseError) as e:
            logger.error(
                "Failed to stop recording for room %s: %s", recording.room.slug, e
            )
            recording.status = RecordingStatusChoices.FAILED_TO_STOP
            raise RecordingStopError() from e
        else:
            recording.status = RecordingStatusChoices[response]
        finally:
            recording.save()

        logger.info("Worker stopped for room %s", recording.room)
