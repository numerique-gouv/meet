"""Recording specific exceptions."""


# todo - discuss if it's a good idea to prefix Exception with Worker
class WorkerRequestError(Exception):
    """
    Exception raised when the request is invalid
    """


class WorkerConnectionError(Exception):
    """
    Exception raised when the client is not accessible
    """


class WorkerResponseError(Exception):
    """
    Exception raised when the response is not as expected
    """


class RecordingStartError(Exception):
    """
    Exception raised when the response is not as expected
    """


class RecordingStopError(Exception):
    """
    Exception raised when the response is not as expected
    """


class InvalidBucketError(Exception):
    """Exception raised when the bucket name in the request does not match the expected one."""


class InvalidRequestDataError(Exception):
    """
    Exception raised when the request data is malformed, incomplete, or missing.
    """


class InvalidFileTypeError(Exception):
    """
    Exception raised when the file type in the request is not supported.
    """


class IgnoreNotificationError(Exception):
    """
    Exception raised when a notification should be ignored due to non-critical issues.
    """


class RecordingNotFound(Exception):
    """
    Exception raised when the requested recording cannot be found in the database.
    """


class RecordingUpdateError(Exception):
    """
    Exception raised when the requested recording can not be updated.
    """
