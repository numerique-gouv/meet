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
    def is_administrator(cls, roles):
        """Check if a role is administrator."""
        return bool(set(roles).intersection({RoleChoices.OWNER, RoleChoices.ADMIN}))


class RecordingStatusChoices(models.TextChoices):
    """Recording status choices."""

    RECORDING = "recording", _("Recording")
    DONE = "done", _("Done")


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

    def is_administrator(self, user):
        """
        Check if a user is administrator of the resource.
        Users carrying the "owner" role are considered as administrators a fortiori.
        """
        return RoleChoices.is_administrator(self.get_roles(user))

    def is_owner(self, user):
        """Check if a user is owner of the resource."""
        return RoleChoices.OWNER in self.get_roles(user)

    def get_roles(self, user):
        """Compute the roles a user has in a room."""
        if not user or not user.is_authenticated:
            return self.accesses.none()

        try:
            roles = self.user_roles or []
        except AttributeError:
            try:
                roles = self.accesses.filter(user=user).values_list("role", flat=True)
            except (models.ObjectDoesNotExist, IndexError):
                roles = self.accesses.none()
        return roles

    def get_abilities(self, user):
        """Compute and return abilities for a given user on the room."""
        roles = self.get_roles(user)
        is_owner_or_admin = RoleChoices.is_administrator(roles)

        return {
            "start_recording": is_owner_or_admin,
            "destroy": RoleChoices.OWNER in roles,
            "manage_accesses": is_owner_or_admin,
            "partial_update": is_owner_or_admin,
            "retrieve": True,
            "update": is_owner_or_admin,
        }


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

    def start_recording(self):
        """Create a new related recording object to which Livekit will be able to save a file."""
        return Recording.objects.create(room=self)


class Recording(BaseModel):
    """Model for recording meetings that take place in a room"""

    room = models.ForeignKey(
        Room, on_delete=models.CASCADE, related_name="meetings", verbose_name=_("Room")
    )
    stopped_at = models.DateTimeField(verbose_name=_("End Time"), null=True, blank=True)
    status = models.CharField(
        choices=RecordingStatusChoices, default=RecordingStatusChoices.RECORDING
    )

    class Meta:
        db_table = "meet_recording"
        ordering = ("created_at",)
        verbose_name = _("Recording")
        verbose_name_plural = _("Recordings")

    def __str__(self):
        return _(
            f"Recording in {self.room.name:s} on {self.created_at:%B %d, %Y at %I:%M %p}"
        )

    @property
    def key(self):
        """Return the path where the recording file will be stored in object storage."""
        return f"recordings/{self.pk!s}/file.mp4/"

    def get_abilities(self, user):
        """Compute and return abilities for a given user on the recording."""
        roles = self.room.get_roles(user)

        return {
            "destroy": RoleChoices.OWNER in roles,
            "partial_update": False,
            "retrieve": False,
            "stop": True,
            "update": False,
        }
