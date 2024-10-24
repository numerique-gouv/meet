"""Recording worker and session classes"""

# pylint: disable=no-member

import logging
from abc import ABC, abstractmethod

import aiohttp
from asgiref.sync import async_to_sync
from livekit.api import TwirpError
from livekit.api.egress_service import EgressService
from livekit.protocol import egress as proto_egress

from core.models import Recording, RecordingModeChoices, RecordingStatusChoices

from .exceptions import (
    RecordingStartError,
    RecordingStopError,
    WorkerConnectionError,
    WorkerRequestError,
    WorkerResponseError,
)

logger = logging.getLogger(__name__)


class AbstractRecordingWorker(ABC):
    """
    Abstract base class for recording workers.

    This class defines the interface that recording workers must implement
    for starting and stopping recordings. It ensures that any recording
    worker used will have the necessary methods for managing the recording
    lifecycle.

    Methods:
        __init__: Initializes the worker with the required configurations.
        start_recording: Asynchronously starts a recording session.
        stop_recording: Asynchronously stops a recording session.
    """

    @abstractmethod
    def __init__(
        self,
        output_folder: str,
        server_configurations: dict,
        enable_output_logging: bool,
    ):
        """Initialize the recording worker with the output folder and server configurations.

        Args:
            output_folder (str): Path where the recording files will be stored.
            server_configurations (dict): Configuration settings for the recording service.
        """

    @abstractmethod
    async def start_recording(self, recording: Recording) -> str:
        """Start a recording session.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            str: The unique identifier for the recording session (e.g., egress ID).
        """

    @abstractmethod
    async def stop_recording(self, recording: Recording) -> RecordingStatusChoices:
        """Stop a recording session.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            RecordingStatusChoices: The final status of the recording (e.g., STOPPED or ABORTED).
        """


class RecordingSessionManager:
    """
    Manage the lifecycle of a recording session using a recording worker.

    This class acts as a wrapper around an `AbstractRecordingWorker` instance.
    It is responsible for starting and stopping recordings, updating the recording's
    status in the database, and handling errors.

    Methods:
        start_recording: Start a recording session using the provided worker.
        stop_recording: Stop a recording session using the provided worker.
    """

    def __init__(self, worker_class, **kwargs):
        """Initialize the RecordingWorker with the specified recording worker.

        Args:
            worker_class (AbstractRecordingWorker): An implementation of the recording worker.
        """
        self._worker: AbstractRecordingWorker = worker_class(**kwargs)

    def start_recording(self, recording: Recording):
        """Start a recording session.

        This method attempts to start a recording using the configured worker.
        It updates the recording's status and handles any potential errors during
        the process.

        Args:
            recording (Recording): The recording object with necessary details.

        Raises:
            RecordingStartError: If the recording fails to start.
        """
        try:
            worker_id = self._worker.start_recording(recording)
            recording.worker_id = worker_id
            recording.status = RecordingStatusChoices.ACTIVE
        except (WorkerRequestError, WorkerConnectionError, WorkerResponseError) as e:
            logger.error(
                "Failed to start recording for room %s: %s", recording.room.slug, e
            )
            recording.status = RecordingStatusChoices.FAILED_TO_START
            raise RecordingStartError() from e
        finally:
            recording.save()

        logger.info(
            "Worker started for room %s (worker ID: %s, mode: %s)",
            recording.room,
            recording.worker_id,
            recording.mode,
        )

    def stop_recording(self, recording: Recording):
        """Stop a recording session.

        This method attempts to stop a recording using the configured worker.
        It updates the recording's status and handles any potential errors during
        the process.

        Args:
            recording (Recording): The recording object with necessary details.

        Raises:
            RecordingStopError: If the recording fails to stop.
        """
        try:
            recording.status = self._worker.stop_recording(recording)
        except (WorkerConnectionError, WorkerResponseError) as e:
            logger.error(
                "Failed to stop recording for room %s: %s", recording.room.slug, e
            )
            recording.status = RecordingStatusChoices.FAILED_TO_STOP
            raise RecordingStopError() from e
        finally:
            recording.save()

        logger.info("Worker stopped for room %s", recording.room)


class LivekitEgressWorker(AbstractRecordingWorker):
    """
    Worker class to handle LiveKit recording egress.

    This class implements the necessary methods to start and stop recordings
    through LiveKit's egress service. It builds requests based on recording
    details and communicates with LiveKit to manage recording sessions.

    Methods:
        start_recording: Start a recording in LiveKit.
        stop_recording: Stop a recording in LiveKit.
    """

    # FIXME - I feel it bulky
    MODE_MAPPINGS = {
        RecordingModeChoices.SCREEN_RECORDING: {
            "type": proto_egress.EncodedFileType.MP4,
            "extension": "mp4",
            "extra_params": {},
        },
        RecordingModeChoices.TRANSCRIPT: {
            "type": proto_egress.EncodedFileType.OGG,
            "extension": "ogg",
            "extra_params": {"audio_only": True},
        },
    }

    def __init__(
        self,
        output_folder: str,
        server_configurations: dict,
        enable_output_logging: bool,
    ):
        """Initialize the LiveKit worker with the output folder and server configurations.

        Args:
            output_folder (str): Path where the recording files will be stored.
            server_configurations (dict): Configuration settings for connecting to LiveKit.
            enable_output_logging (bool): Flag indicating whether to log the recording output data.
        """
        self._output_folder = output_folder
        self._server_configurations = server_configurations
        self._enable_output_logging = enable_output_logging

    def _create_start_request(self, recording):
        """Create a request to start a recording in LiveKit.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            proto_egress.RoomCompositeEgressRequest: The request to start recording in LiveKit.

        Raises:
            WorkerRequestError: If the file type is unknown or unsupported by LiveKit.
        """

        try:
            file_details = self.MODE_MAPPINGS[recording.mode]
        except KeyError as e:
            logger.error("Unknown recording mode for %s: %s", recording.id, e)
            raise WorkerRequestError(
                f"Unknown recording mode: {recording.mode}"
            ) from e

        filepath = f"{self._output_folder}/{recording.id}.{file_details['extension']}"

        # FIXME - align room's name everywhere else in the code
        slug = f"{recording.room.id!s}".replace("-", "")

        return proto_egress.RoomCompositeEgressRequest(
            room_name=slug,
            file_outputs=[
                proto_egress.EncodedFileOutput(
                    file_type=file_details["type"],
                    filepath=filepath,
                )
            ],
            **file_details["extra_params"],
        )

    @async_to_sync
    async def start_recording(self, recording):
        """Start a recording session in LiveKit.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            str: The egress ID for the started recording session.

        Raises:
            WorkerConnectionError: If there is a connection error with LiveKit.
            WorkerResponseError: If the response from LiveKit is invalid or missing data.
        """

        async with aiohttp.ClientSession() as session:
            client = EgressService(session, **self._server_configurations)
            request = self._create_start_request(recording)

            try:
                response = await client.start_room_composite_egress(start=request)
            except TwirpError as e:
                raise WorkerConnectionError(
                    f"LiveKit client connection error, {e.message}."
                ) from e

            if not response.egress_id:
                raise WorkerResponseError("Egress ID not found in the response.")

            return response.egress_id

    @staticmethod
    def _create_stop_request(recording):
        """Create a request to stop a recording in LiveKit.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            proto_egress.StopEgressRequest: The request to stop the recording in LiveKit.
        """
        return proto_egress.StopEgressRequest(
            egress_id=recording.worker_id,
        )

    @staticmethod
    def _log_recording_data(egress_info):
        """Extract and logs file information from the recording data."""

        try:
            filename = egress_info.file.filename
            started_at = egress_info.file.started_at
            ended_at = egress_info.file.ended_at
            duration = egress_info.file.duration

            # todo - enhance, see with Jacques how and where to log, or log to posthog
            logger.info(
                "Extracted file info - Filename: %s, Started At: %d, Ended At: %d, Duration: %d",
                filename,
                started_at or "N/A",
                ended_at or "N/A",
                duration or "N/A",
            )
        except:
            pass

    @async_to_sync
    async def stop_recording(self, recording):
        """Stop a recording session in LiveKit.

        Args:
            recording (Recording): A recording object containing the necessary details.

        Returns:
            RecordingStatusChoices: The final status of the recording session.

        Raises:
            WorkerConnectionError: If there is a connection error with LiveKit.
            WorkerResponseError: If the response from LiveKit is invalid or missing data.
        """

        async with aiohttp.ClientSession() as session:
            client = EgressService(session, **self._server_configurations)
            request = self._create_stop_request(recording)

            try:
                response = await client.stop_egress(stop=request)
            except TwirpError as e:
                raise WorkerConnectionError(
                    f"LiveKit client connection error, {e.message}."
                ) from e

            if not response.status:
                raise WorkerResponseError(
                    "LiveKit response is missing the recording status."
                )

            if response.status == proto_egress.EgressStatus.EGRESS_ABORTED:
                return RecordingStatusChoices.ABORTED

            # FIXME - bulky should be improved
            if self._enable_output_logging:
                self._log_recording_data(response)

            return RecordingStatusChoices.STOPPED
