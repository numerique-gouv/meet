import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { LiveKitRoom, type LocalUserChoices } from '@livekit/components-react'
import {
  Room,
  RoomOptions,
  ExternalE2EEKeyProvider,
  DeviceUnsupportedError,
} from 'livekit-client'
import { keys } from '@/api/queryKeys'
import { queryClient } from '@/api/queryClient'
import { Screen } from '@/layout/Screen'
import { QueryAware } from '@/components/QueryAware'
import { ErrorScreen } from '@/components/ErrorScreen'
import { fetchRoom } from '../api/fetchRoom'
import { ApiRoom } from '../api/ApiRoom'
import { useCreateRoom } from '../api/createRoom'
import { InviteDialog } from './InviteDialog'

import { VideoConference } from '../livekit/prefabs/VideoConference'
import posthog from 'posthog-js'
import { css } from '@/styled-system/css'

export const Conference = ({
  roomId,
  userConfig,
  initialRoomData,
  mode = 'join',
}: {
  roomId: string
  userConfig: LocalUserChoices
  mode?: 'join' | 'create'
  initialRoomData?: ApiRoom
}) => {
  useEffect(() => {
    posthog.capture('visit-room', { slug: roomId })
  }, [roomId])
  const fetchKey = [keys.room, roomId, userConfig.username]

  const {
    mutateAsync: createRoom,
    status: createStatus,
    isError: isCreateError,
  } = useCreateRoom({
    onSuccess: (data) => {
      queryClient.setQueryData(fetchKey, data)
    },
  })

  const {
    status: fetchStatus,
    isError: isFetchError,
    data,
  } = useQuery({
    queryKey: fetchKey,
    staleTime: 6 * 60 * 60 * 1000, // By default, LiveKit access tokens expire 6 hours after generation
    initialData: initialRoomData,
    queryFn: () =>
      fetchRoom({
        roomId: roomId as string,
        username: userConfig.username,
      }).catch((error) => {
        if (error.statusCode == '404') {
          createRoom({ slug: roomId, username: userConfig.username })
        }
      }),
    retry: false,
  })

  const worker =
    typeof window !== 'undefined' &&
    new Worker(new URL('livekit-client/e2ee-worker', import.meta.url))

  const e2eeEnabled = !!worker
  const keyProvider = new ExternalE2EEKeyProvider()

  const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false)

  const roomOptions = useMemo((): RoomOptions => {
    // todo - explain why
    const videoCodec = e2eeEnabled ? undefined : 'vp9'

    const e2ee = e2eeEnabled ? { keyProvider, worker } : undefined

    return {
      adaptiveStream: true,
      dynacast: true,
      publishDefaults: {
        // todo - explain why
        red: !e2eeEnabled,
        videoCodec,
      },
      videoCaptureDefaults: {
        deviceId: userConfig.videoDeviceId ?? undefined,
      },
      audioCaptureDefaults: {
        deviceId: userConfig.audioDeviceId ?? undefined,
      },
      e2ee,
    }
    // do not rely on the userConfig object directly as its reference may change on every render
  }, [userConfig.videoDeviceId, userConfig.audioDeviceId])

  const room = useMemo(() => new Room(roomOptions), [roomOptions])

  useEffect(() => {
    if (!data) {
      return
    }
    if (e2eeEnabled) {
      keyProvider
        .setKey(data.livekit?.passphrase)
        .then(() => {
          room.setE2EEEnabled(true).catch((e) => {
            if (e instanceof DeviceUnsupportedError) {
              alert(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`
              )
              console.error(e)
            } else {
              throw e
            }
          })
        })
        .then(() => setE2eeSetupComplete(true))
    } else {
      setE2eeSetupComplete(true)
    }
  }, [e2eeEnabled, room, data])

  const [showInviteDialog, setShowInviteDialog] = useState(mode === 'create')

  const { t } = useTranslation('rooms')
  if (isCreateError) {
    // this error screen should be replaced by a proper waiting room for anonymous user.
    return (
      <ErrorScreen
        title={t('error.createRoom.heading')}
        body={t('error.createRoom.body')}
      />
    )
  }

  // Some clients (like DINUM) operate in bandwidth-constrained environments
  // These settings help ensure successful connections in poor network conditions
  const connectOptions = {
    maxRetries: 5, // Default: 1. Only for unreachable server scenarios
    peerConnectionTimeout: 60000, // Default: 15s. Extended for slow TURN/TLS negotiation
  }

  const handleEncryptionError = () => {
    console.log('error')
  }

  return (
    <QueryAware status={isFetchError ? createStatus : fetchStatus}>
      <Screen header={false} footer={false}>
        <LiveKitRoom
          room={room}
          serverUrl={data?.livekit?.url}
          token={data?.livekit?.token}
          connect={e2eeSetupComplete}
          audio={userConfig.audioEnabled}
          video={userConfig.videoEnabled}
          connectOptions={connectOptions}
          className={css({
            backgroundColor: 'primaryDark.50 !important',
          })}
          onEncryptionError={handleEncryptionError}
        >
          <VideoConference />
          {showInviteDialog && (
            <InviteDialog
              isOpen={showInviteDialog}
              onOpenChange={setShowInviteDialog}
              roomId={roomId}
              onClose={() => setShowInviteDialog(false)}
            />
          )}
        </LiveKitRoom>
      </Screen>
    </QueryAware>
  )
}
