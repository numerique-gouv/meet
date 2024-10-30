"""
Declare and configure the models for the Meet core application
"""

import uuid
from logging import getLogger

from django.conf import settings
from django.contrib.auth import models as auth_models
from django.contrib.auth.base_user import AbstractBaseUser
from django.core import mail, validators
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import models
from django.utils.functional import lazy
from django.utils.text import capfirst, slugify
from django.utils.translation import gettext_lazy as _

from timezone_field import TimeZoneField

logger = getLogger(__name__)


class RoleChoices(models.TextChoices):
    """Role choices."""

    MEMBER = "member", _("Member")
    ADMIN = "administrator", _("Administrator")
    OWNER = "owner", _("Owner")

    @classmethod
    def check_administrator_role(cls, role):
        """Check if a role is administrator."""
        return role in [cls.ADMIN, cls.OWNER]

    @classmethod
    def check_owner_role(cls, role):
        """Check if a role is owner."""
        return role == cls.OWNER


class RecordingStatusChoices(models.TextChoices):
    """Recording status choices."""

    ACTIVE = "active", _("Active")
    STOPPED = "stopped", _("Stopped")
    ABORTED = "aborted", _("Aborted")
    SAVED = "saved", _("Saved")
    FAILED_TO_START = "failed_to_start", _("Failed to Start")
    FAILED_TO_STOP = "failed_to_stop", _("Failed to Stop")

    @classmethod
    def is_final_status(cls, status):
        """Check if the status is a final status."""
        return status in [
            cls.STOPPED,
            cls.SAVED,
            cls.ABORTED,
            cls.FAILED_TO_START,
            cls.FAILED_TO_STOP,
        ]

    @classmethod
    def is_error_status(cls, status):
        """Check if the status is an error status."""
        return status in [cls.ABORTED, cls.FAILED_TO_START, cls.FAILED_TO_STOP]


class RecordingModeChoices(models.TextChoices):
    """Recording mode choices."""

    SCREEN_RECORDING = "screen_recording", _("SCREEN_RECORDING")
    TRANSCRIPT = "transcript", _("TRANSCRIPT")


class BaseModel(models.Model):
    """
    Serves as an abstract base model for other models, ensuring that records are validated
    before saving as Django doesn't do it by default.

    Includes fields common to all models: a UUID primary key and creation/update timestamps.
    """

    id = models.UUIDField(
        verbose_name=_("id"),
        help_text=_("primary key for the record as UUID"),
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    created_at = models.DateTimeField(
        verbose_name=_("created on"),
        help_text=_("date and time at which a record was created"),
        auto_now_add=True,
        editable=False,
    )
    updated_at = models.DateTimeField(
        verbose_name=_("updated on"),
        help_text=_("date and time at which a record was last updated"),
        auto_now=True,
        editable=False,
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """Call `full_clean` before saving."""
        self.full_clean()
        super().save(*args, **kwargs)


class User(AbstractBaseUser, BaseModel, auth_models.PermissionsMixin):
    """User model to work with OIDC only authentication."""

    sub_validator = validators.RegexValidator(
        regex=r"^[\w.@+-]+\Z",
        message=_(
            "Enter a valid sub. This value may contain only letters, "
            "numbers, and @/./+/-/_ characters."
        ),
    )

    sub = models.CharField(
        _("sub"),
        help_text=_(
            "Required. 255 characters or fewer. Letters, numbers, and @/./+/-/_ characters only."
        ),
        max_length=255,
        unique=True,
        validators=[sub_validator],
        blank=True,
        null=True,
    )
    email = models.EmailField(_("identity email address"), blank=True, null=True)

    # Unlike the "email" field which stores the email coming from the OIDC token, this field
    # stores the email used by staff users to login to the admin site
    admin_email = models.EmailField(
        _("admin email address"), unique=True, blank=True, null=True
    )

    language = models.CharField(
        max_length=10,
        choices=lazy(lambda: settings.LANGUAGES, tuple)(),
        default=settings.LANGUAGE_CODE,
        verbose_name=_("language"),
        help_text=_("The language in which the user wants to see the interface."),
    )
    timezone = TimeZoneField(
        choices_display="WITH_GMT_OFFSET",
        use_pytz=False,
        default=settings.TIME_ZONE,
        help_text=_("The timezone in which the user wants to see times."),
    )
    is_device = models.BooleanField(
        _("device"),
        default=False,
        help_text=_("Whether the user is a device or a real user."),
    )
    is_staff = models.BooleanField(
        _("staff status"),
        default=False,
        help_text=_("Whether the user can log into this admin site."),
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )

    objects = auth_models.UserManager()

    USERNAME_FIELD = "admin_email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "meet_user"
        verbose_name = _("user")
        verbose_name_plural = _("users")

    def __str__(self):
        return self.email or self.admin_email or str(self.id)

    def email_user(self, subject, message, from_email=None, **kwargs):
        """Email this user."""
        if not self.email:
            raise ValueError("User has no email address.")
        mail.send_mail(subject, message, from_email, [self.email], **kwargs)

    def get_teams(self):
        """
        Get list of teams in which the user is, as a list of strings.
        Must be cached if retrieved remotely.
        """
        return []

    @property
    def email_anonymized(self):
        """Anonymize the email address by replacing the local part with asterisks."""
        if not self.email:
            return ""
        return f"***@{self.email.split('@')[1]}"


class Resource(BaseModel):
    """Model to define access control"""

    is_public = models.BooleanField(default=settings.DEFAULT_ROOM_IS_PUBLIC)
    users = models.ManyToManyField(
        User,
        through="ResourceAccess",
        through_fields=("resource", "user"),
        related_name="resources",
    )

    class Meta:
        db_table = "meet_resource"
        verbose_name = _("Resource")
        verbose_name_plural = _("Resources")

    def __str__(self):
        try:
            return self.name
        except AttributeError:
            return f"Resource {self.id!s}"

    def get_role(self, user):
        """
        Determine the role of a given user in this resource.
        """
        if not user or not user.is_authenticated:
            return None

        role = None
        for access in self.accesses.filter(user=user):
            if access.role == RoleChoices.OWNER:
                return RoleChoices.OWNER
            if access.role == RoleChoices.ADMIN:
                role = RoleChoices.ADMIN
            if access.role == RoleChoices.MEMBER and role != RoleChoices.ADMIN:
                role = RoleChoices.MEMBER
        return role

    def is_administrator(self, user):
        """
        Check if a user is administrator of the resource.

        Users carrying the "owner" role are considered as administrators a fortiori.
        """
        return RoleChoices.check_administrator_role(self.get_role(user))

    def is_owner(self, user):
        """Check if a user is owner of the resource."""
        return RoleChoices.check_owner_role(self.get_role(user))


class ResourceAccess(BaseModel):
    """Link table between resources and users"""

    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name="accesses",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accesses")
    role = models.CharField(
        max_length=20, choices=RoleChoices.choices, default=RoleChoices.MEMBER
    )

    class Meta:
        db_table = "meet_resource_access"
        verbose_name = _("Resource access")
        verbose_name_plural = _("Resource accesses")
        constraints = [
            models.UniqueConstraint(
                fields=["user", "resource"],
                name="resource_access_unique_user_resource",
                violation_error_message=_(
                    "Resource access with this User and Resource already exists."
                ),
            ),
        ]

    def __str__(self):
        role = capfirst(self.get_role_display())
        try:
            resource = self.resource.name
        except AttributeError:
            resource = f"resource {self.resource_id!s}"

        return f"{role:s} role for {self.user!s} on {resource:s}"

    def save(self, *args, **kwargs):
        """Make sure we keep at least one owner for the resource."""
        if self.pk and self.role != RoleChoices.OWNER:
            accesses = self._meta.model.objects.filter(
                resource=self.resource, role=RoleChoices.OWNER
            ).only("pk")
            if len(accesses) == 1 and accesses[0].pk == self.pk:
                raise PermissionDenied("A resource should keep at least one owner.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Disallow deleting the last of the Mohicans."""
        if (
            self.role == RoleChoices.OWNER
            and self._meta.model.objects.filter(
                resource=self.resource, role=RoleChoices.OWNER
            ).count()
            == 1
        ):
            raise PermissionDenied("A resource should keep at least one owner.")
        return super().delete(*args, **kwargs)


class Room(Resource):
    """Model for one room"""

    name = models.CharField(max_length=500)
    resource = models.OneToOneField(
        Resource,
        on_delete=models.CASCADE,
        parent_link=True,
        primary_key=True,
    )
    slug = models.SlugField(max_length=100, blank=True, null=True, unique=True)

    configuration = models.JSONField(
        blank=True,
        default=dict,
        verbose_name=_("Visio room configuration"),
        help_text=_("Values for Visio parameters to configure the room."),
    )

    class Meta:
        db_table = "meet_room"
        ordering = ("name",)
        verbose_name = _("Room")
        verbose_name_plural = _("Rooms")

    def __str__(self):
        return capfirst(self.name)

    def clean_fields(self, exclude=None):
        """
        Automatically generate the slug from the name and make sure it does not look like a UUID.

        We don't want any overlapping between the `slug` and the `id` fields because they can
        both be used to get a room detail view on the API.
        """
        self.slug = slugify(self.name)
        try:
            uuid.UUID(self.slug)
        except ValueError:
            pass
        else:
            raise ValidationError({"name": f'Room name "{self.name:s}" is reserved.'})
        super().clean_fields(exclude=exclude)


# todo - discuss how the path could changed, and we could loose track of file
class Recording(BaseModel):
    """Model for recordings that take place in a room"""

    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="recordings",
        verbose_name=_("Creator"),
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="recordings",
        verbose_name=_("Room"),
    )
    status = models.CharField(
        max_length=20,
        choices=RecordingStatusChoices.choices,
        default=RecordingStatusChoices.ACTIVE,
    )
    mode = models.CharField(
        max_length=20,
        choices=RecordingModeChoices.choices,
        verbose_name=_("Worker kind"),
        help_text=_("Defines the kind of worker being called."),
    )
    worker_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name=_("Worker ID"),
        help_text=_(
            "Enter an identifier for the worker recording. This ID is retained even when"
            "the worker stops, allowing for easy tracking and management of recorded data."
        ),
    )

    class Meta:
        db_table = "meet_recording"
        ordering = ("-created_at",)
        verbose_name = _("Recording")
        verbose_name_plural = _("Recordings")
        constraints = [
            models.UniqueConstraint(
                fields=["room"],
                condition=models.Q(status=RecordingStatusChoices.ACTIVE),
                name="unique_active_recording_per_room",
            )
        ]

    def __str__(self):
        return str(self.id)

    def get_abilities(self, user):
        """Compute and return abilities for a given user on the recording."""
        is_creator = user == self.creator
        is_final_status = RecordingStatusChoices.is_final_status(self.status)

        return {
            "destroy": is_creator and is_final_status,
            "partial_update": False,
            "retrieve": is_creator,
            "stop": is_creator and not is_final_status,
            "update": False,
        }

    def is_savable(self) -> bool:
        """Wip."""

        is_in_error = RecordingStatusChoices.is_error_status(self.status)
        is_already_saved = self.status == RecordingStatusChoices.SAVED

        return not is_in_error and not is_already_saved
