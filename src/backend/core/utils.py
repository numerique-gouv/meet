"""
Utils functions used in the core app
"""
import string
from uuid import uuid4

from django.conf import settings

from livekit.api import AccessToken, VideoGrants


def generate_token(room: string, user) -> str:
    """Generate a Livekit access token for a user in a specific room.

    Args:
        room (str): The name of the room.
        user (User): The user which request the access token.

    Returns:
        str: The LiveKit JWT access token.
    """

    # todo - define the video grants properly based on user and room.
    video_grants = VideoGrants(
        room=room,
        room_join=True,
        can_publish_sources=[
            "camera",
            "microphone",
            "screen_share",
            "screen_share_audio",
        ],
    )

    token = AccessToken(
        api_key=settings.LIVEKIT_CONFIGURATION["api_key"],
        api_secret=settings.LIVEKIT_CONFIGURATION["api_secret"],
    ).with_grants(video_grants)

    if user.is_anonymous:
        # todo - allow passing a proper name for not logged-in user
        token.with_identity(str(uuid4()))
    else:
        # todo - use user's fullname instead of its email for the displayed name
        token.with_identity(user.sub).with_name(f"{user!s}")

    return token.to_jwt()
