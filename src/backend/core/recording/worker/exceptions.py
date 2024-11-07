"""Recording and worker services specific exceptions."""


class WorkerRequestError(Exception):
    """Raised when there is an issue with the worker request"""


class WorkerConnectionError(Exception):
    """Raised when there is an issue connecting to the worker."""


class WorkerResponseError(Exception):
    """Raised when the worker's response is not as expected."""


class RecordingStartError(Exception):
    """Raised when there is an error starting the recording."""


class RecordingStopError(Exception):
    """Raised when there is an error stopping the recording."""
