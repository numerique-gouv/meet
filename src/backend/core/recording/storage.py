"""Recording storage classes"""

import logging
import re
from abc import ABC, abstractmethod

from core.models import Recording, RecordingStatusChoices

from .exceptions import (
    IgnoreNotificationError,
    InvalidBucketError,
    InvalidFileTypeError,
    InvalidRequestDataError,
    RecordingNotFound,
    RecordingUpdateError,
)

logger = logging.getLogger(__name__)


class AbstractHookParser(ABC):
    """Abstract base class for hook parsers.

    This class defines the interface for hook parsers, which are responsible
    for parsing and validating incoming hook data from external sources.
    """

    @abstractmethod
    def __init__(self, bucket_name):
        """Initialize the hook parser with a bucket name.

        Args:
            bucket_name (str): The name of the bucket where data is stored.
        """

    @abstractmethod
    def extract_recording_id(self, data) -> str:
        """Parse and validate the incoming hook data.

        Args:
            data (dict): The data received from the hook.

        Returns:
            recording_id: The ID of the recording object.

        Raises:
            InvalidRequestDataError: If the data format is invalid.
            InvalidBucketError: If the bucket in the data does not match the expected one.
            InvalidFileTypeError: If the file type is not supported.
        """


class StorageHandler:
    """
    Handle storage-related operations for recording data.

    This class processes incoming data, validates it, and updates the
    status of the recording in the database accordingly.
    """

    def __init__(self, bucket_name, parser_class):
        """Initialize the storage handler with a bucket and parser class.

        Args:
            bucket_name (str): The name of the bucket where data is stored.
            parser_class (class): A class that parses incoming hook data.
        """

        self._parser = parser_class(bucket_name=bucket_name)

    @staticmethod
    def _update_recording(recording):
        """Update the status of the recording to 'SAVED'.

        Args:
            recording (Recording): The recording instance to update.

        Raises:
            RecordingUpdateError: If the recording is already saved or
                                  is in an error state.
        """

        # todo - check others status
        if RecordingStatusChoices.is_error_status(recording.status):
            logger.error(
                "Recording with ID %s is in an error state and cannot be saved.",
                recording.id,
            )
            raise RecordingUpdateError(
                f"Recording with ID {recording.id} is in an error state and cannot be saved."
            )

        if recording.status == RecordingStatusChoices.SAVED:
            logger.error("Recording with ID %s is already saved.", recording.id)
            raise RecordingUpdateError(
                f"Recording with ID {recording.id} is already saved."
            )

        recording.status = RecordingStatusChoices.SAVED
        recording.save()

        logger.info("Recording with ID %s was successfully saved.", recording)

    def on_save(self, data) -> Recording:
        """Handle the process of updating a recording's status based on incoming data.

        This method parses the incoming data, validates the recording,
        and updates its status to "SAVED" in the database.

        Args:
            data (dict): The data received from the hook.

        Returns:
            Recording: The updated recording object.

        Raises:
            IgnoreNotificationError: If the data is invalid or irrelevant.
            RecordingNotFound: If the recording with the given ID cannot be found.
        """

        try:
            recording_id = self._parser.extract_recording_id(data)
        except InvalidRequestDataError as e:
            logger.error("Could not handle hook event %s", e)
            logger.debug("Invalid request data: %s", data)
            raise IgnoreNotificationError("Invalid request data received.") from e

        except InvalidBucketError as e:
            logger.error("Invalid bucket queried: %s", e)
            raise IgnoreNotificationError("Invalid bucket specified.") from e

        except InvalidFileTypeError as e:
            logger.info("Ignored event as it does not pertain to a recording. %s", e)
            logger.debug("Non-recording file detected in request: %s", data)
            raise IgnoreNotificationError("Invalid file type received.") from e

        try:
            recording = Recording.objects.get(recording_id)
        except Recording.DoesNotExist as e:
            logger.error("Recording with ID %s not found.", recording_id)
            raise RecordingNotFound(
                f"Recording with ID {recording_id} not found."
            ) from e

        self._update_recording(recording)

        return recording


class MinioParser(AbstractHookParser):
    """Parser for handling incoming Minio hook data.

    This class extracts essential information such as the bucket name,
    filename, and file type from the incoming hook data. It also provides
    methods for extracting and validating recording IDs.
    """

    # Todo - discuss if it should be an instance attribute
    FILENAME_PATTERN = re.compile(
        r"(?P<recording_id>[0-9a-fA-F\-]{36})\.(?P<file_type>[a-zA-Z0-9]+)"
    )

    def __init__(self, bucket_name):
        """Initialize the MinioParser with the expected bucket name.

        Args:
            bucket_name (str): The name of the bucket where recording files are stored.
        """
        self._bucket_name = bucket_name

    @staticmethod
    def _extract(data):
        """Extract the bucket name, filename, and file type from the Minio event data.

        This method parses the incoming event data to extract key fields such as the
        bucket name, the filename (which contains the recording ID), and the file type.

        Args:
            data (dict): The event payload data received from Minio, containing the file
                         and bucket details.

        Returns:
            tuple: A tuple containing the extracted bucket name (str), filename (str),
                   and file type (str).

        Raises:
            InvalidRequestDataError: If the data is missing or has unexpected structure.
            KeyError: If required fields are missing in the data.
            IndexError: If the event data doesn't follow the expected structure.
        """

        if not data:
            raise InvalidRequestDataError("Received empty data")

        try:
            record = data["Records"][0]
            s3 = record["s3"]
            bucket_name = s3["bucket"]["name"]
            filename = s3["object"]["key"]
            filetype = s3["object"]["contentType"]
        except KeyError as e:
            raise InvalidRequestDataError(f"Missing required field: {e}") from e
        except IndexError as e:
            raise InvalidRequestDataError(f"Unexpected data structure: {e}") from e

        if not filename or not filetype or not bucket_name:
            raise InvalidRequestDataError(
                "Missing essential data fields: filename, filetype, or bucket name"
            )

        return bucket_name, filename, filetype

    def extract_recording_id(self, data):
        """Extract and validate the recording ID from the event's filename.

        This method checks if the extracted bucket name matches the expected bucket,
        validates that the file type is correct, and ensures that the filename conforms
        to the expected format (`{recording_id}.{file_type}`). The recording ID must
        be a valid UUID (v4).

        Args:
            data (dict): The event payload data from Minio.

        Returns:
            str: The validated recording ID extracted from the filename.

        Raises:
            InvalidBucketError: If the bucket name in the data doesn't match the expected bucket.
            InvalidFileTypeError: If the file type is not 'audio/ogg'.
            InvalidRequestDataError: If the filename doesn't follow the expected format.
        """

        bucket_name, filename, filetype = self._extract(data)

        if bucket_name != self._bucket_name:
            raise InvalidBucketError(
                f"Invalid bucket: expected {self._bucket_name}, got {bucket_name}"
            )

        # FIXME - bulky, not extensible
        if not "ogg" in filetype and not "mp4" in filetype:
            raise InvalidFileTypeError(
                f"Invalid file type, expected 'ogg' or 'mp4', got '{filetype}'"
            )

        match = self.FILENAME_PATTERN.match(filename)
        if not match:
            raise InvalidRequestDataError(f"Invalid filename structure: {filename}")

        recording_id = match.group("recording_id")

        return recording_id
