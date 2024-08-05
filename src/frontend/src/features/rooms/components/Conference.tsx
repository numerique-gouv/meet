import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LiveKitRoom,
  VideoConference,
  type LocalUserChoices,
} from '@livekit/components-react'
import {createLocalVideoTrack, Room, RoomOptions} from 'livekit-client'
import { BackgroundBlur } from '@livekit/track-processors'
import { keys } from '@/api/queryKeys'
import { navigateTo } from '@/navigation/navigateTo'
import { Screen } from '@/layout/Screen'
import { QueryAware } from '@/components/QueryAware'
import { fetchRoom } from '../api/fetchRoom'
import { InviteDialog } from './InviteDialog'

export const Conference = ({
  roomId,
  userConfig,
  mode = 'join',
}: {
  roomId: string
  userConfig: LocalUserChoices
  mode?: 'join' | 'create'
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

  const room = useMemo(() => new Room(roomOptions), [roomOptions])

  const [showInviteDialog, setShowInviteDialog] = useState(mode === 'create')

  /**
   * checks for actual click on the leave button instead of
   * relying on LiveKitRoom onDisconnected because onDisconnected
   * triggers even on page reload, it's not a user "onLeave" event really.
   * Here we want to react to the user actually deciding to leave.
   */
  useEffect(() => {
    const checkOnLeaveClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.classList.contains('lk-disconnect-button')) {
        navigateTo('feedback')
      }
    }
    document.body.addEventListener('click', checkOnLeaveClick)
    return () => {
      document.body.removeEventListener('click', checkOnLeaveClick)
    }
  }, [])

  room.localParticipant.setName('antoine')

  const blurTrack = async () => {
    const blur = BackgroundBlur(10);
    const track = room.localParticipant.videoTrackPublications.values().next().value;
    if(!track) {
      return
    }
    await track.videoTrack.setProcessor(blur);
  }

  const unBlurTrack = async () => {
    const track = room.localParticipant.videoTrackPublications.values().next().value;
    if(!track) {
      return
    }
    await track.videoTrack.stopProcessor();
  }


  room.on('dataReceived', (payload, participant) => {
    const message = new TextDecoder().decode(payload);
    console.log(`Received message from ${participant?.identity}: ${message}`);
  });

  const sendMessage = async (message) =>  {
    // Convert message to a Uint8Array

    console.log('clicked')
    const payload = new TextEncoder().encode(message);

    // Send the message to all participants in the room
    await room.localParticipant.publishData(payload, 'text/plain');
  }

  return (
    <QueryAware status={status}>
      <Screen>
        <button onClick={() => blurTrack()}>blur</button>
        <button onClick={() => unBlurTrack()}>unblur</button>
        <button onClick={() => sendMessage('raise hand')}>raise hand</button>
        <LiveKitRoom
          room={room}
          serverUrl={data?.livekit?.url}
          token={data?.livekit?.token}
          connect={true}
          audio={userConfig.audioEnabled}
          video={userConfig.videoEnabled}
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
