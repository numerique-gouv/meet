"""Permission handlers for the Meet core app."""

from django.conf import settings

from rest_framework import permissions

from ..models import RoleChoices

ACTION_FOR_METHOD_TO_PERMISSION = {
    "versions_detail": {"DELETE": "versions_destroy", "GET": "versions_retrieve"}
}


class IsAuthenticated(permissions.BasePermission):
    """
    Allows access only to authenticated users. Alternative method checking the presence
    of the auth token to avoid hitting the database.
    """

    def has_permission(self, request, view):
        return bool(request.auth) or request.user.is_authenticated


class IsAuthenticatedOrSafe(IsAuthenticated):
    """Allows access to authenticated users (or anonymous users but only on safe methods)."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return super().has_permission(request, view)


class IsSelf(IsAuthenticated):
    """
    Allows access only to authenticated users. Alternative method checking the presence
    of the auth token to avoid hitting the database.
    """

    def has_object_permission(self, request, view, obj):
        """Write permissions are only allowed to the user itself."""
        return obj == request.user


class RoomPermissions(permissions.BasePermission):
    """
    Permissions applying to the room API endpoint.
    """

    def has_permission(self, request, view):
        """Only allow authenticated users for unsafe methods."""
        if request.method in permissions.SAFE_METHODS:
            return True

        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Object permissions are only given to administrators of the room."""

        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user

        if request.method == "DELETE":
            return obj.is_owner(user)

        return obj.is_administrator(user)


class IsRoomOwnerOrAdministrator(permissions.BasePermission):
    """Temporary"""

    message = "You must be an admin or owner to start a recording."

    def has_permission(self, request, view):
        # Get the room object
        room = view.get_object()

        if not room.is_owner(request.user) and not room.is_administrator(request.user):
            return False

        return True


class ResourceAccessPermission(permissions.BasePermission):
    """
    Permissions for a room that can only be updated by room administrators.
    """

    def has_permission(self, request, view):
        """Only allow authenticated users."""
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """
        Check that the logged-in user is administrator of the linked room.
        """
        user = request.user
        if request.method == "DELETE" and obj.role == RoleChoices.OWNER:
            return obj.user == user

        return obj.resource.is_administrator(user)


class IsRecordingEnabled(permissions.BasePermission):
    """Check if the recording feature is enabled."""

    message = "Access denied, recording is disabled."

    def has_permission(self, request, view):
        """Determine if access is allowed based on settings."""
        return settings.RECORDING_ENABLE


class IsStorageEventEnabled(permissions.BasePermission):
    """Check if the storage event feature is enabled."""

    message = "Access denied, storage event is disabled."

    def has_permission(self, request, view):
        """Determine if access is allowed based on settings."""
        return settings.RECORDING_STORAGE_EVENT_ENABLE
