"""API endpoints"""

import re
import uuid
from urllib.parse import urlparse

from django.conf import settings
from django.db.models import Q
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify

from rest_framework import (
    decorators,
    exceptions,
    mixins,
    pagination,
    status,
    viewsets,
)
from rest_framework import (
    response as drf_response,
)

from core import models, utils

from ..analytics import analytics
from . import permissions, serializers

# pylint: disable=too-many-ancestors

UUID_REGEX = (
    r"[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}"
)
RECORDING_URL_PATTERN = re.compile(
    f"{settings.MEDIA_URL:s}recordings/({UUID_REGEX:s})/file.mp4/$"
)


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

    permission_classes = [permissions.AccessPermission]
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
            analytics.track(
                user=self.request.user,
                event="Get Room",
                properties={"slug": instance.slug},
            )
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

        analytics.track(
            user=self.request.user,
            event="Create Room",
            properties={
                "slug": room.slug,
            },
        )

    @decorators.action(detail=True, methods=["post"], url_path="start-recording")
    def start_recording(self, request, *args, **kwargs):
        """This view is used to start a recording for a room."""
        # Check permission first
        room = self.get_object()
        recording = room.start_recording()

        return drf_response.Response(
            {"recording": recording.id}, status=status.HTTP_201_CREATED
        )


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
    permission_classes = [permissions.AccessPermission]
    queryset = models.Recording.objects.all()
    serializer_class = serializers.RecordingSerializer

    def list(self, request, *args, **kwargs):
        """Restrict resources returned by the list endpoint to a user's room."""
        queryset = self.filter_queryset(self.get_queryset())
        user = self.request.user
        if user.is_authenticated:
            queryset = queryset.filter(room__accesses__user=user)
        else:
            queryset = queryset.none()

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return drf_response.Response(serializer.data)

    @decorators.action(detail=True, methods=["post"], url_path="stop")
    def stop(self, request, *args, **kwargs):
        """
        This view is used to stop a recording. It can be called anonymously as the
        recording ID will not have been communicated anywhere at the time of recording.
        """
        recording = self.get_object()

        if recording.stopped_at is not None:
            raise exceptions.PermissionDenied()

        recording.stopped_at = timezone.now()
        recording.save()

        # TODO: Generate summary and send to note taking app

        serializer = self.get_serializer(recording)
        return drf_response.Response(serializer.data, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=["get"], url_path="retrieve-auth")
    def retrieve_auth(self, request, *args, **kwargs):
        """
        This view is used by an Nginx subrequest to control access to a recording file.

        The original url is passed by nginx in the "HTTP_X_ORIGINAL_URL" header.
        See corresponding ingress configuration in Helm chart and read about the
        nginx.ingress.kubernetes.io/auth-url annotation to understand how the Nginx ingress
        is configured to do this.

        Based on the original url and the logged in user, we must decide if we authorize Nginx
        to let this request go through (by returning a 200 code) or if we block it (by returning
        a 403 error). Note that we return 403 errors without any further details for security
        reasons.

        When we let the request go through, we compute authorization headers that will be added to
        the request going through thanks to the nginx.ingress.kubernetes.io/auth-response-headers
        annotation. The request will then be proxied to the object storage backend who will
        respond with the file after checking the signature included in headers.
        """
        if not request.user.is_authenticated:
            raise exceptions.AuthenticationFailed()

        original_url = urlparse(request.META.get("HTTP_X_ORIGINAL_URL"))
        match = RECORDING_URL_PATTERN.search(original_url.path)

        try:
            (pk,) = match.groups()
        except AttributeError as excpt:
            raise exceptions.PermissionDenied() from excpt

        # Check permission
        if not models.Recording.objects.filter(
            pk=pk, room__accesses__user=request.user
        ).exists():
            raise exceptions.PermissionDenied()

        # Generate authorization headers and return an authorization to proceed with the request
        key = models.Recording(pk=pk).key
        request = utils.generate_s3_authorization_headers(key)
        return drf_response.Response("authorized", headers=request.headers, status=200)
