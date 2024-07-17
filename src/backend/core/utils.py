"""
Utils functions used in the core app
"""
from typing import Optional
from uuid import uuid4

from django.conf import settings

from livekit.api import AccessToken, VideoGrants


def generate_token(room: str, user, username: Optional[str] = None) -> str:
    """Generate a Livekit access token for a user in a specific room.

    Args:
        room (str): The name of the room.
        user (User): The user which request the access token.
        username (Optional[str]): The username to be displayed in the room.
                         If none, a default value will be used.

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
        token.with_identity(str(uuid4()))
        default_username = "Anonymous"
    else:
        token.with_identity(user.sub)
        default_username = str(user)

    token.with_name(username or default_username)

    return token.to_jwt()
