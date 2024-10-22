"""
Utils functions used in the core app
"""

# ruff: noqa:S311
# pylint: disable=no-member

import hashlib
import json
import random
from typing import Optional
from uuid import uuid4

from django.conf import settings

import aiohttp
from asgiref.sync import async_to_sync
from livekit.api import AccessToken, TwirpError, VideoGrants
from livekit.api.egress_service import EgressService
from livekit.protocol import egress as proto_egress


def generate_color(identity: str) -> str:
    """Generates a consistent HSL color based on a given identity string.

    The function seeds the random generator with the identity's hash,
    ensuring consistent color output. The HSL format allows fine-tuned control
    over saturation and lightness, empirically adjusted to produce visually
    appealing and distinct colors. HSL is preferred over hex to constrain the color
    range and ensure predictability.
    """

    # ruff: noqa:S324
    identity_hash = hashlib.sha1(identity.encode("utf-8"))
    # Keep only hash's last 16 bits, collisions are not a concern
    seed = int(identity_hash.hexdigest(), 16) & 0xFFFF
    random.seed(seed)
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


@async_to_sync
async def start_egress(room):
    """Start room recording using LiveKit's Egress service."""

    if not room or not room.id:
        raise ValueError("Invalid room object")

    # FIXME - Temporary, liveKit removes dashes in room's name
    room_name = str(room.id).replace("-", "")

    try:
        async with aiohttp.ClientSession() as session:
            egress_service = EgressService(
                session=session, **settings.LIVEKIT_CONFIGURATION
            )

            # TODO - discuss whether we organize recordings in subfolder
            response = await egress_service.start_room_composite_egress(
                start=proto_egress.RoomCompositeEgressRequest(
                    room_name=room_name,
                    file_outputs=[
                        proto_egress.EncodedFileOutput(
                            file_type=proto_egress.EncodedFileType.MP4,
                            filepath="{room_name}{time}.mp4",
                        )
                    ],
                )
            )

            return {
                "egress_id": response.egress_id,
                "filename": response.file.filename,
            }

    except TwirpError as e:
        # TODO - log error
        raise RuntimeError(
            "An error occurred while starting the room recording."
        ) from e
