"""
Utils functions used in the core app
"""

# ruff: noqa:S311

import json
import random
from typing import Optional
from uuid import uuid4

from django.conf import settings

from livekit.api import AccessToken, VideoGrants


def generate_color(identity: str) -> str:
    """Generates a consistent HSL color based on a given identity string.

    The function seeds the random generator with the identity's hash,
    ensuring consistent color output. The HSL format allows fine-tuned control
    over saturation and lightness, empirically adjusted to produce visually
    appealing and distinct colors. HSL is preferred over hex to constrain the color
    range and ensure predictability.
    """

    random.seed(hash(identity))
    hue = random.randint(0, 360)
    saturation = random.randint(50, 75)
    lightness = random.randint(25, 60)

    return f"hsl({hue}, {saturation}%, {lightness}%)"


def generate_token(room: str, user, username: Optional[str] = None) -> str:
    """Generate a LiveKit access token for a user in a specific room.

    Args:
        room (str): The name of the room.
        user (User): The user which request the access token.
        username (Optional[str]): The username to be displayed in the room.
                         If none, a default value will be used.

    Returns:
        str: The LiveKit JWT access token.
    """
    video_grants = VideoGrants(
        room=room,
        room_join=True,
        room_admin=True,
        can_update_own_metadata=True,
        can_publish_sources=[
            "camera",
            "microphone",
            "screen_share",
            "screen_share_audio",
        ],
    )

    if user.is_anonymous:
        identity = str(uuid4())
        default_username = "Anonymous"
    else:
        identity = str(user.sub)
        default_username = str(user)

    token = (
        AccessToken(
            api_key=settings.LIVEKIT_CONFIGURATION["api_key"],
            api_secret=settings.LIVEKIT_CONFIGURATION["api_secret"],
        )
        .with_grants(video_grants)
        .with_identity(identity)
        .with_name(username or default_username)
        .with_metadata(json.dumps({"color": generate_color(identity)}))
    )

    return token.to_jwt()
