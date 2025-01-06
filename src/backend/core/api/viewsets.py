"""API endpoints"""

import uuid
from logging import getLogger

from django.conf import settings
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils.text import slugify

from rest_framework import (
    decorators,
    mixins,
    pagination,
    viewsets,
)
from rest_framework import (
    exceptions as drf_exceptions,
)
from rest_framework import (
    response as drf_response,
)
from rest_framework import (
    status as drf_status,
)

from core import models, utils
from core.recording.event.authentication import StorageEventAuthentication
from core.recording.event.exceptions import (
    InvalidBucketError,
    InvalidFileTypeError,
    ParsingEventDataError,
)
from core.recording.event.notification import notification_service
from core.recording.event.parsers import get_parser
from core.recording.worker.exceptions import (
    RecordingStartError,
    RecordingStopError,
)
from core.recording.worker.factories import (
    get_worker_service,
)
from core.recording.worker.mediator import (
    WorkerServiceMediator,
)

from . import permissions, serializers

from livekit import api as livekit_api

# pylint: disable=too-many-ancestors

logger = getLogger(__name__)


class NestedGenericViewSet(viewsets.GenericViewSet):
    """
    A generic Viewset aims to be used in a nested route context.
    e.g: `/api/v1.0/resource_1/<resource_1_pk>/resource_2/<resource_2_pk>/`

    It allows to define all url kwargs and lookup fields to perform the lookup.
    """

    lookup_fields: list[str] = ["pk"]
    lookup_url_kwargs: list[str] = []

    def __getattribute__(self, item):
        """
        This method is overridden to allow to get the last lookup field or lookup url kwarg
        when accessing the `lookup_field` or `lookup_url_kwarg` attribute. This is useful
        to keep compatibility with all methods used by the parent class `GenericViewSet`.
        """
        if item in ["lookup_field", "lookup_url_kwarg"]:
            return getattr(self, item + "s", [None])[-1]

        return super().__getattribute__(item)

    def get_queryset(self):
        """
        Get the list of items for this view.

        `lookup_fields` attribute is enumerated here to perform the nested lookup.
        """
        queryset = super().get_queryset()

        # The last lookup field is removed to perform the nested lookup as it corresponds
        # to the object pk, it is used within get_object method.
        lookup_url_kwargs = (
            self.lookup_url_kwargs[:-1]
            if self.lookup_url_kwargs
            else self.lookup_fields[:-1]
        )

        filter_kwargs = {}
        for index, lookup_url_kwarg in enumerate(lookup_url_kwargs):
            if lookup_url_kwarg not in self.kwargs:
                raise KeyError(
                    f"Expected view {self.__class__.__name__} to be called with a URL "
                    f'keyword argument named "{lookup_url_kwarg}". Fix your URL conf, or '
                    "set the `.lookup_fields` attribute on the view correctly."
                )

            filter_kwargs.update(
                {self.lookup_fields[index]: self.kwargs[lookup_url_kwarg]}
            )

        return queryset.filter(**filter_kwargs)


class SerializerPerActionMixin:
    """
    A mixin to allow to define serializer classes for each action.

    This mixin is useful to avoid to define a serializer class for each action in the
    `get_serializer_class` method.
    """

    serializer_classes: dict[str, type] = {}
    default_serializer_class: type = None

    def get_serializer_class(self):
        """
        Return the serializer class to use depending on the action.
        """
        return self.serializer_classes.get(self.action, self.default_serializer_class)


class Pagination(pagination.PageNumberPagination):
    """Pagination to display no more than 100 objects per page sorted by creation date."""

    ordering = "-created_on"
    max_page_size = 100
    page_size_query_param = "page_size"


class UserViewSet(
    mixins.UpdateModelMixin, viewsets.GenericViewSet, mixins.ListModelMixin
):
    """User ViewSet"""

    permission_classes = [permissions.IsSelf]
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer

    def get_queryset(self):
        """
        Limit listed users by querying the email field with a trigram similarity
        search if a query is provided.
        Limit listed users by excluding users already in the document if a document_id
        is provided.
        """
        queryset = self.queryset

        if self.action == "list":
            # Exclude all users already in the given document
            if document_id := self.request.GET.get("document_id", ""):
                queryset = queryset.exclude(documentaccess__document_id=document_id)

            # Filter users by email similarity
            if query := self.request.GET.get("q", ""):
                queryset = queryset.filter(email__trigram_word_similar=query)

        return queryset

    @decorators.action(
        detail=False,
        methods=["get"],
        url_name="me",
        url_path="me",
        permission_classes=[permissions.IsAuthenticated],
    )
    def get_me(self, request):
        """
        Return information on currently logged user
        """
        context = {"request": request}
        return drf_response.Response(
            self.serializer_class(request.user, context=context).data
        )


class RoomViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoints to access and perform actions on rooms.
    """

    permission_classes = [permissions.RoomPermissions]
    queryset = models.Room.objects.all()
    serializer_class = serializers.RoomSerializer

    def get_object(self):
        """Allow getting a room by its slug."""
        try:
            uuid.UUID(self.kwargs["pk"])
            filter_kwargs = {"pk": self.kwargs["pk"]}
        except ValueError:
            filter_kwargs = {"slug": slugify(self.kwargs["pk"])}
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, **filter_kwargs)
        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        return obj

    def retrieve(self, request, *args, **kwargs):
        """
        Allow unregistered rooms when activated.
        For unregistered rooms we only return a null id and the livekit room and token.
        """

        # todo - determine whether encryption is needed store a shared secret in memory or in redis
        # todo - check if a secret already exists, else create one.

        try:
            instance = self.get_object()
        except Http404:
            if not settings.ALLOW_UNREGISTERED_ROOMS:
                raise
            slug = slugify(self.kwargs["pk"])
            username = request.query_params.get("username", None)
            data = {
                "id": None,
                "livekit": {
                    "url": settings.LIVEKIT_CONFIGURATION["url"],
                    "room": slug,
                    "token": utils.generate_token(
                        room=slug, user=request.user, username=username
                    ),
                },
            }
        else:
            data = self.get_serializer(instance).data

        return drf_response.Response(data)

    def list(self, request, *args, **kwargs):
        """Limit listed rooms to the ones related to the authenticated user."""
        user = self.request.user

        if user.is_authenticated:
            queryset = (
                self.filter_queryset(self.get_queryset()).filter(users=user).distinct()
            )
        else:
            queryset = self.get_queryset().none()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return drf_response.Response(serializer.data)

    def perform_create(self, serializer):
        """Set the current user as owner of the newly created room."""
        room = serializer.save()
        models.ResourceAccess.objects.create(
            resource=room,
            user=self.request.user,
            role=models.RoleChoices.OWNER,
        )

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="start-recording",
        permission_classes=[
            permissions.HasPrivilegesOnRoom,
            permissions.IsRecordingEnabled,
        ],
    )
    def start_room_recording(self, request, pk=None):  # pylint: disable=unused-argument
        """Start recording a room."""

        serializer = serializers.StartRecordingSerializer(data=request.data)

        if not serializer.is_valid():
            return drf_response.Response(
                {"detail": "Invalid request."}, status=drf_status.HTTP_400_BAD_REQUEST
            )

        mode = serializer.validated_data["mode"]
        room = self.get_object()

        # May raise exception if an active or initiated recording already exist for the room
        recording = models.Recording.objects.create(room=room, mode=mode)

        models.RecordingAccess.objects.create(
            user=self.request.user, role=models.RoleChoices.OWNER, recording=recording
        )

        worker_service = get_worker_service(mode=recording.mode)
        worker_manager = WorkerServiceMediator(worker_service=worker_service)

        try:
            worker_manager.start(recording)
        except RecordingStartError:
            return drf_response.Response(
                {"error": f"Recording failed to start for room {room.slug}"},
                status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return drf_response.Response(
            {"message": f"Recording successfully started for room {room.slug}"},
            status=drf_status.HTTP_201_CREATED,
        )

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="stop-recording",
        permission_classes=[
            permissions.HasPrivilegesOnRoom,
            permissions.IsRecordingEnabled,
        ],
    )
    def stop_room_recording(self, request, pk=None):  # pylint: disable=unused-argument
        """Stop room recording."""

        room = self.get_object()

        try:
            recording = models.Recording.objects.get(
                room=room, status=models.RecordingStatusChoices.ACTIVE
            )
        except models.Recording.DoesNotExist as e:
            raise drf_exceptions.NotFound(
                "No active recording found for this room."
            ) from e

        worker_service = get_worker_service(mode=recording.mode)
        worker_manager = WorkerServiceMediator(worker_service=worker_service)

        try:
            worker_manager.stop(recording)
        except RecordingStopError:
            return drf_response.Response(
                {"error": f"Recording failed to stop for room {room.slug}"},
                status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return drf_response.Response(
            {"message": f"Recording stopped for room {room.slug}."}
        )

    @decorators.action(
        detail=False,
        methods=["post"],
        url_path="livekit-webhook",
        permission_classes=[],
        authentication_classes=[],
    )
    def handle_livekit_webhook(self, request, pk=None):  # pylint: disable=unused-argument
        """Handle LiveKit webhook events."""
        auth_token = request.headers.get("Authorization")
        if not auth_token:
            return drf_response.Response(
                {"error": "Missing LiveKit authentication token"},
                status=drf_status.HTTP_401_UNAUTHORIZED
            )

        token_verifier = livekit_api.TokenVerifier()
        webhook_receiver = livekit_api.WebhookReceiver(token_verifier)

        webhook_data = webhook_receiver.receive(request.body.decode("utf-8"), auth_token)

        # Todo - livekit triggers a webhook for all events, see if we can restrict webhook to a limited number of events.
        # Todo - handle Egress stopped / aborted events.

        if webhook_data.event == "room_finished":
            room_id = webhook_data.room.name
            utils.clear_cache_passphrase(room_id)

        return drf_response.Response({"message": f"Event processed"})


class ResourceAccessListModelMixin:
    """List mixin for resource access API."""

    def get_permissions(self):
        """User only needs to be authenticated to list rooms access"""
        if self.action == "list":
            permission_classes = [permissions.IsAuthenticated]
        else:
            return super().get_permissions()

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Return the queryset according to the action."""
        queryset = super().get_queryset()
        if self.action == "list":
            user = self.request.user
            queryset = queryset.filter(
                Q(resource__accesses__user=user),
                resource__accesses__role__in=[
                    models.RoleChoices.ADMIN,
                    models.RoleChoices.OWNER,
                ],
            ).distinct()
        return queryset


class ResourceAccessViewSet(
    ResourceAccessListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoints to access and perform actions on resource accesses.
    """

    permission_classes = [permissions.ResourceAccessPermission]
    queryset = models.ResourceAccess.objects.all()
    serializer_class = serializers.ResourceAccessSerializer


class RecordingViewSet(
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    """
    API endpoints to access and perform actions on recordings.
    """

    pagination_class = Pagination
    permission_classes = [permissions.HasAbilityPermission]
    queryset = models.Recording.objects.all()
    serializer_class = serializers.RecordingSerializer

    def get_queryset(self):
        """Restrict recordings to the user's ones."""
        user = self.request.user
        return (
            super()
            .get_queryset()
            .filter(Q(accesses__user=user) | Q(accesses__team__in=user.get_teams()))
        )

    @decorators.action(
        detail=False,
        methods=["post"],
        url_path="storage-hook",
        authentication_classes=[StorageEventAuthentication],
        permission_classes=[permissions.IsStorageEventEnabled],
    )
    def on_storage_event_received(self, request, pk=None):  # pylint: disable=unused-argument
        """Handle incoming storage hook events for recordings."""

        parser = get_parser()

        try:
            recording_id = parser.get_recording_id(request.data)

        except ParsingEventDataError as e:
            raise drf_exceptions.PermissionDenied(f"Invalid request data: {e}") from e

        except InvalidBucketError as e:
            raise drf_exceptions.PermissionDenied("Invalid bucket specified") from e

        except InvalidFileTypeError as e:
            return drf_response.Response(
                {"message": f"Ignore this file type, {e}"},
            )

        try:
            recording = models.Recording.objects.get(id=recording_id)
        except models.Recording.DoesNotExist as e:
            raise drf_exceptions.NotFound("No recording found for this event.") from e

        if not recording.is_savable():
            raise drf_exceptions.PermissionDenied(
                f"Recording with ID {recording_id} cannot be saved because it is either,"
                " in an error state or has already been saved."
            )

        # Attempt to notify external services about the recording
        # This is a non-blocking operation - failures are logged but don't interrupt the flow
        notification_succeeded = notification_service.notify_external_services(
            recording
        )

        recording.status = (
            models.RecordingStatusChoices.NOTIFICATION_SUCCEEDED
            if notification_succeeded
            else models.RecordingStatusChoices.SAVED
        )
        recording.save()

        return drf_response.Response(
            {"message": "Event processed."},
        )
