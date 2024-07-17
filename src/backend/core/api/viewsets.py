"""API endpoints"""
import json
import smtplib
import uuid

from django.conf import settings
from django.contrib.sites.models import Site
from django.core import mail
from django.db.models import Q
from django.http import Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _

from rest_framework import (
    decorators,
    mixins,
    pagination,
    viewsets,
)
from rest_framework import (
    response as drf_response,
)

from core import models, utils

from . import permissions, serializers

# pylint: disable=too-many-ancestors


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
        try:
            instance = self.get_object()
        except Http404:
            if not settings.ALLOW_UNREGISTERED_ROOMS:
                raise
            slug = slugify(self.kwargs["pk"])
            data = {
                "id": None,
                "livekit": {
                    "url": settings.LIVEKIT_CONFIGURATION["url"],
                    "room": slug,
                    "token": utils.generate_token(room=slug, user=request.user),
                },
            }
        else:
            data = self.get_serializer(instance).data

        return drf_response.Response(data)

    def list(self, request, *args, **kwargs):
        """Limit listed rooms to the ones related to the authenticated user."""
        user = self.request.user

        if user.is_authenticated:
            # todo - simplify this queryset
            queryset = (
                self.filter_queryset(self.get_queryset())
                .filter(Q(users=user))
                .distinct()
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


def invite(request):
    """PoC of sending email invitation."""

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    data = json.loads(request.body)
    emails = data.get("emails")
    room = data.get("room")

    if not emails or not room:
        return JsonResponse(
            {"error": "Emails and room are required fields."}, status=400
        )

    try:
        template_vars = {
            "title": _("Invitation to join a room!"),
            "site": Site.objects.get_current(),
            "room": room,
            "sender": str(request.user),
        }
        msg_html = render_to_string("mail/html/invitation.html", template_vars)
        msg_plain = render_to_string("mail/text/invitation.txt", template_vars)
        mail.send_mail(
            _("Invitation to join a room!"),
            msg_plain,
            settings.EMAIL_FROM,
            emails,
            html_message=msg_html,
            fail_silently=False,
        )
    except smtplib.SMTPException:
        return JsonResponse({"error": "Failed to send invitation emails"}, status=500)

    return JsonResponse({"msg": "invitation sent."}, status=200)
