import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  formatChatMessageLinks,
  LiveKitRoom,
  type LocalUserChoices,
} from '@livekit/components-react'
import { Room, RoomOptions } from 'livekit-client'
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

  const room = useMemo(() => new Room(roomOptions), [roomOptions])

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

  return (
    <QueryAware status={isFetchError ? createStatus : fetchStatus}>
      <Screen header={false}>
        <LiveKitRoom
          room={room}
          serverUrl={data?.livekit?.url}
          token={data?.livekit?.token}
          connect={true}
          audio={userConfig.audioEnabled}
          video={userConfig.videoEnabled}
        >
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
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
