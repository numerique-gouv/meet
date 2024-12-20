"""Marketing service in charge of pushing data for marketing automation."""

import logging
from dataclasses import dataclass
from typing import Dict, List, Optional

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

import brevo_python

logger = logging.getLogger(__name__)


class ContactCreationError(Exception):
    """Raised when the contact creation fails."""


@dataclass
class ContactData:
    """Data structure for contact information."""

    email: str
    attributes: Optional[Dict[str, str]] = None
    list_ids: Optional[List[int]] = None
    update_enabled: bool = True


class MarketingService:
    """Service for managing marketing automation.

    Currently, implements Brevo as our marketing automation platform for:
    - Contact list management
    - User segmentation
    - Marketing campaign automation
    - Email communications

    Note: This is an initial implementation focused on Brevo integration.
    Future iterations may abstract common marketing operations to support
    additional platforms or migration needs. Consider refactoring core
    functionality into platform-agnostic interfaces as requirements evolve.
    """

    def __init__(self):
        """Initialize the marketing service."""

        if not settings.BREVO_API_KEY:
            raise ImproperlyConfigured("Brevo API key is required")

        configuration = brevo_python.Configuration()
        configuration.api_key["api-key"] = settings.BREVO_API_KEY

        self._api_client = brevo_python.ApiClient(configuration)

    def create_contact(self, contact_data: ContactData, timeout=None) -> dict:
        """Create or update a contact in Brevo.

        Contacts are automatically added to both a shared list for "La Suite"
        and Visio list. Both lists' ids are configured via settings.BREVO_API_CONTACT_LIST_IDS.
        Additional list assignments can be specified through contact_data.list_ids.

        Contact attributes are essential for segmentation within lists and power marketing
        automation workflows.

        Each product should define its own specific attributes to avoid conflicts. As our Brevo
        integration is new, we expect to iterate on which attributes to track based on marketing
        automation needs. Attributes must be pre-configured in Brevo's interface.

        Note: Take care when defining new attributes or modifying existing ones, as these
        changes can impact marketing workflows and segmentation across products.
        """

        if not settings.BREVO_API_CONTACT_LIST_IDS:
            raise ImproperlyConfigured(
                "Default Brevo List IDs must be configured in settings."
            )

        contact_api = brevo_python.ContactsApi(self._api_client)

        attributes = {
            **settings.BREVO_API_CONTACT_ATTRIBUTES,
            **(contact_data.attributes or {}),
        }

        list_ids = (contact_data.list_ids or []) + settings.BREVO_API_CONTACT_LIST_IDS

        contact = brevo_python.CreateContact(
            email=contact_data.email,
            attributes=attributes,
            list_ids=list_ids,
            update_enabled=contact_data.update_enabled,
        )

        kwargs = {}

        if timeout is not None:
            kwargs["_request_timeout"] = timeout

        try:
            response = contact_api.create_contact(contact, **kwargs)
        except brevo_python.rest.ApiException as err:
            logger.exception("Failed to create contact in Brevo")
            raise ContactCreationError("Failed to create contact in Brevo") from err

        return response
