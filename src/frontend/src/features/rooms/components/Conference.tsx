import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import {
  LiveKitRoom,
  VideoConference,
  type LocalUserChoices,
} from '@livekit/components-react'
import { keys } from '@/api/queryKeys'
import { QueryAware } from '@/layout/QueryAware'
import { navigateToHome } from '@/features/home'
import { fetchRoom } from '../api/fetchRoom'

export const Conference = ({
  userConfig,
}: {
  userConfig: LocalUserChoices
}) => {
  const { roomId } = useParams()
  const { status, data } = useQuery({
    queryKey: [keys.room, roomId, userConfig.username],
    queryFn: () =>
      fetchRoom({
        roomId: roomId as string,
        username: userConfig.username,
      }),
  })

  return (
    <QueryAware status={status}>
      <LiveKitRoom
        serverUrl={data?.livekit?.url}
        token={data?.livekit?.token}
        connect={true}
        audio={{
          deviceId: userConfig.audioDeviceId,
        }}
        video={{
          deviceId: userConfig.videoDeviceId,
        }}
        onDisconnected={() => {
          navigateToHome()
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </QueryAware>
  )
}
