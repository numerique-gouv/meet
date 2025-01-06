import { useEffect, useMemo, useRef, useState } from 'react'
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

// todo - release worker when quitting the room, same for the key provider?
// todo - check, seems the demo app from livekit trigger the web worker twice because of re-rendering

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

  const e2eeEnabled = true

  const workerRef = useRef<Worker | null>(null)
  const keyProvider = useRef<any | null>(null)

  const getKeyProvider = () => {
    if (!keyProvider.current && typeof window !== 'undefined') {
      keyProvider.current = new ExternalE2EEKeyProvider()
    }
    return keyProvider.current
  }

  const getWorker = () => {
    if (!e2eeEnabled) {
      return
    }
    if (!workerRef.current && typeof window !== 'undefined') {
      workerRef.current = new Worker(
        new URL('livekit-client/e2ee-worker', import.meta.url)
      )
    }
    return workerRef.current
  }

  const e2eePassphrase = data?.livekit?.passphrase

  const [e2eeSetupComplete, setE2eeSetupComplete] = useState(false)

  const roomOptions = useMemo((): RoomOptions => {
    const worker = getWorker()
    const keyProvider = getKeyProvider()

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
    console.log('enter', e2eePassphrase)
    if (e2eePassphrase) {
      const keyProvider = getKeyProvider()
      keyProvider
        .setKey(e2eePassphrase)
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
    }
  }, [room, e2eePassphrase])

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
