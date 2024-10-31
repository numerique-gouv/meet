"""Recording and storage services specific exceptions."""


class ParsingEventDataError(Exception):
    """Raised when the request data is malformed, incomplete, or missing."""


class InvalidBucketError(Exception):
    """Raised when the bucket name in the request does not match the expected one."""


class InvalidFileTypeError(Exception):
    """Raised when the file type in the request is not supported."""


class InvalidFilepathError(Exception):
    """Raised when the filepath in the request is invalid."""
