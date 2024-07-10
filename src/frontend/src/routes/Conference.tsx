import { fetchRoom } from '@/api/fetchRoom'
import { BoxScreen } from '@/layout/BoxScreen'
import { ErrorScreen } from '@/layout/ErrorScreen'
import { ForbiddenScreen } from '@/layout/ForbiddenScreen'
import { LoadingScreen } from '@/layout/LoadingScreen'
import { Screen } from '@/layout/Screen'
import { A } from '@/primitives/A'
import { H1 } from '@/primitives/H'
import { keys } from '@/queries/keys'
import {
  LiveKitRoom,
  VideoConference,
  PreJoin,
  LocalUserChoices,
} from '@livekit/components-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'wouter'

export const Conference = () => {
  const { roomId } = useParams()
  const [, navigate] = useLocation()
  const { status, data } = useQuery({
    queryKey: [keys.room, roomId],
    queryFn: ({ queryKey }) => fetchRoom(queryKey[1] as string),
  })

  const [userConfig, setUserConfig] = useState<LocalUserChoices | null>(null)

  if (!userConfig) {
    return (
      <BoxScreen>
        <H1>Verify your settings before joining</H1>
        <PreJoin
          persistUserChoices
          onSubmit={(choices) => {
            setUserConfig(choices)
          }}
        />
        <p>
          <Link to="/" asChild>
            <A size="small">Back to homescreen</A>
          </Link>
        </p>
      </BoxScreen>
    )
  }

  if (status === 'error' || (status === 'success' && !data?.livekit)) {
    return <ErrorScreen />
  }

  if (data?.is_public === false) {
    return <ForbiddenScreen />
  }

  if (data?.livekit?.token && data?.livekit?.url) {
    return (
      <Screen>
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
            navigate('/')
          }}
        >
          <VideoConference />
        </LiveKitRoom>
      </Screen>
    )
  }

  return <LoadingScreen />
}
