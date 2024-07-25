import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query'
import {
  LiveKitRoom,
  VideoConference,
  type LocalUserChoices,
} from '@livekit/components-react'
import { Room, RoomOptions } from "livekit-client";
import { keys } from '@/api/queryKeys'
import { navigateTo } from '@/navigation/navigateTo'
import { QueryAware } from '@/layout/QueryAware'
import { fetchRoom } from '../api/fetchRoom'

export const Conference = ({
  roomId,
  userConfig,
}: {
  roomId: string
  userConfig: LocalUserChoices
}) => {
  const { status, data } = useQuery({
    queryKey: [keys.room, roomId, userConfig.username],
    queryFn: () =>
      fetchRoom({
        roomId: roomId as string,
        username: userConfig.username,
      }),
  })

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userConfig.videoDeviceId ?? undefined,
      },
      audioCaptureDefaults: {
        deviceId: userConfig.audioDeviceId ?? undefined,
      },
    }
    // do not rely on the userConfig object directly as its reference may change on every render
  }, [userConfig.videoDeviceId, userConfig.audioDeviceId])

  const room = useMemo(() => new Room(roomOptions), [roomOptions]);

  return (
    <QueryAware status={status}>
      <LiveKitRoom
        room={room}
        serverUrl={data?.livekit?.url}
        token={data?.livekit?.token}
        connect={true}
        audio={userConfig.audioEnabled}
        video={userConfig.videoEnabled}
        onDisconnected={() => {
          navigateTo('home')
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </QueryAware>
  )
}
