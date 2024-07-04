import asyncio
import aiohttp
from livekit.api.egress_service import EgressService
from livekit.api import TrackEgressRequest, DirectFileOutput


async def main():
    async with aiohttp.ClientSession() as session:
        e = EgressService(
            session=session,
            api_key="***",
            api_secret="***",
            url="http://localhost:7880/"
        )

        print(e)

        file = DirectFileOutput(
            filepath="recording/my-room-test.mp4"
        )

        request = TrackEgressRequest(
            room_name= "your-room-name",
            track_id= "TR_XXXXXXXXXXXX",
            file=file,
        )

        await e.start_track_egress(
            start=request
        )

if __name__ == "__main__":
    asyncio.run(main())
