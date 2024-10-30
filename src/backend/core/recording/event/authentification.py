"""Authentication class for storage event token validation."""

import logging
import secrets

from django.conf import settings
from django.utils.translation import gettext_lazy as _

from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class StorageEventAuthentication(BaseAuthentication):
    """Authenticate requests using a Bearer token for storage event integration.

    This class validates Bearer tokens for storage events that don't map to database users.
    It's designed for S3-compatible storage integrations and similar use cases.

    Events are submitted when a webhook is configured on some bucket's events.
    """

    AUTH_HEADER = "Authorization"
    TOKEN_TYPE = "Bearer"  # noqa S105

    def authenticate(self, request):
        """Validate the Bearer token from the Authorization header."""

        required_token = settings.RECORDING_STORAGE_EVENT_TOKEN
        if not required_token:
            return None

        auth_header = request.headers.get(self.AUTH_HEADER)

        if not auth_header:
            logger.warning(
                "Authentication failed: Missing Authorization header (ip: %s)",
                request.META.get("REMOTE_ADDR"),
            )
            raise AuthenticationFailed(_("Authorization header is required"))

        auth_parts = auth_header.split(" ")
        if len(auth_parts) != 2 or auth_parts[0] != self.TOKEN_TYPE:
            logger.warning(
                "Authentication failed: Invalid authorization header (ip: %s)",
                request.META.get("REMOTE_ADDR"),
            )
            raise AuthenticationFailed(_("Invalid authorization header."))

        token = auth_parts[1]

        # Use constant-time comparison to prevent timing attacks
        if not secrets.compare_digest(token.encode(), required_token.encode()):
            logger.warning(
                "Authentication failed: Invalid token (ip: %s)",
                request.META.get("REMOTE_ADDR"),
            )
            raise AuthenticationFailed(_("Invalid token"))

        return None

    def authenticate_header(self, request):
        """Return the WWW-Authenticate header value."""
        return f"{self.TOKEN_TYPE} realm='Storage event API'"
