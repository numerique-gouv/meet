
import re
import logging

from dataclasses import dataclass
from functools import lru_cache
from typing import Any, Dict, Protocol, Optional

from django.conf import settings
from django.utils.module_loading import import_string


from .exceptions import ParsingEventDataError, InvalidBucketError, InvalidFileTypeError, InvalidFilepathError

logger = logging.getLogger(__name__)

@dataclass
class StorageEvent:
    """Represents a storage event with relevant metadata.

    Attributes:
        filepath: Identifier for the affected recording
        filetype: Type of storage event
        bucket_name: When the event occurred
        metadata: Additional event data
    """

    filepath: str
    filetype: str
    bucket_name: str
    metadata: Optional[Dict[str, Any]]


class EventParser(Protocol):
    """Wip."""

    def __init__(self, bucket_name, allowed_filetypes = None):
        """Wip."""

    def parse(self, data: Dict) -> StorageEvent:
        """Wip."""

    def validate(self, data: StorageEvent) -> None:
        """Wip."""

    def get_recording_id(self, data: Dict) -> str:
        """Wip."""


# todo - explain we don't need a factory class, a function with cache is enough
@lru_cache(maxsize=1)
def get_parser() -> EventParser:
    """Wip."""

    event_parser_cls = import_string(settings.RECORDING_EVENT_PARSER_CLASS)
    return event_parser_cls(bucket_name=settings.AWS_STORAGE_BUCKET_NAME)


class MinioParser:
    """Wip."""



    def __init__(self, bucket_name, allowed_filetypes = None):
        """Wip."""

        self._bucket_name = bucket_name
        self._allowed_filetypes = allowed_filetypes or  {"audio/ogg", "video/mp4"}

        self._filepath_regex = re.compile(
            r"(?P<folder>(?:[^%]+%2F)*)?(?P<recording_id>[0-9a-fA-F\-]{36})\.(?P<extension>[a-zA-Z0-9]+)"
        )


    @staticmethod
    def parse(data):
        """Wip."""

        if not data:
            raise ParsingEventDataError("Received empty data")

        try:
            record = data["Records"][0]
            s3 = record["s3"]
            bucket_name = s3["bucket"]["name"]
            file_object = s3["object"]
            filepath = file_object["key"]
            filetype = file_object["contentType"]
        except (KeyError, IndexError) as e:

            # todo - be more actionable
            raise ParsingEventDataError(f"Missing or malformed field in event data: {e}") from e

        try:
            return StorageEvent(
                filepath=filepath,
                filetype=filetype,
                bucket_name=bucket_name,
            )
        except TypeError as e:

            # todo - be more actionable

            raise ParsingEventDataError(
                "Missing essential data fields: filepath, filetype, or bucket name"
            ) from e

    def validate(self, event_data: StorageEvent) -> str:
        """Wip."""

        if event_data.bucket_name != self._bucket_name:
            raise InvalidBucketError(
                f"Invalid bucket: expected {self._bucket_name}, got {event_data.bucket_name}"
            )

        if not event_data.filetype in self._allowed_filetypes:
            raise InvalidFileTypeError(
                f"Invalid file type, expected {self._allowed_filetypes}, got '{event_data.filetype}'"
            )

        match = self._filepath_regex.match(event_data.filepath)
        if not match:
            raise InvalidFilepathError(f"Invalid filepath structure: {event_data.filepath}")

        recording_id = match.group("recording_id")
        return recording_id


    def get_recording_id(self, data):
        """Wip."""

        event_data = self.parse(data)
        recording_id = self.validate(event_data)

        return recording_id




