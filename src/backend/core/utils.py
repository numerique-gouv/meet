"""
Utils functions used in the core app
"""

# ruff: noqa:S311

import hashlib
import json
import random
from typing import Optional
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage

import botocore
from livekit.api import AccessToken, VideoGrants


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


def generate_s3_authorization_headers(key):
    """
    Generate authorization headers for an s3 object.
    These headers can be used as an alternative to signed urls with many benefits:
    - the urls of our files never expire and can be stored in our documents' content
    - we don't leak authorized urls that could be shared (file access can only be done
      with cookies)
    - access control is truly realtime
    - the object storage service does not need to be exposed on internet
    """
    url = default_storage.unsigned_connection.meta.client.generate_presigned_url(
        "get_object",
        ExpiresIn=0,
        Params={"Bucket": default_storage.bucket_name, "Key": key},
    )
    request = botocore.awsrequest.AWSRequest(method="get", url=url)

    s3_client = default_storage.connection.meta.client
    # pylint: disable=protected-access
    credentials = s3_client._request_signer._credentials  # noqa: SLF001
    frozen_credentials = credentials.get_frozen_credentials()
    region = s3_client.meta.region_name
    auth = botocore.auth.S3SigV4Auth(frozen_credentials, "s3", region)
    auth.add_auth(request)

    return request
