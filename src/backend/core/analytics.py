"""
Meet analytics class.
"""

import uuid

from django.conf import settings

from june import analytics as jAnalytics


class Analytics:
    """Analytics integration

    This class wraps the June analytics code to avoid coupling our code directly
    with this third-party library. By doing so, we create a generic interface
    for analytics that can be easily modified or replaced in the future.
    """

    def __init__(self):
        key = getattr(settings, "ANALYTICS_KEY", None)

        if key is not None:
            jAnalytics.write_key = key

        self._enabled = key is not None

    def _is_anonymous_user(self, user):
        """Check if the user is anonymous."""
        return user is None or user.is_anonymous

    def identify(self, user, **kwargs):
        """Identify a user"""

        if self._is_anonymous_user(user) or not self._enabled:
            return

        traits = kwargs.pop("traits", {})
        traits.update({"email": user.email_anonymized})

        jAnalytics.identify(user_id=user.sub, traits=traits, **kwargs)

    def track(self, user, **kwargs):
        """Track an event"""

        if not self._enabled:
            return

        event_data = {}
        if self._is_anonymous_user(user):
            event_data["anonymous_id"] = str(uuid.uuid4())
        else:
            event_data["user_id"] = user.sub

        jAnalytics.track(**event_data, **kwargs)


analytics = Analytics()
