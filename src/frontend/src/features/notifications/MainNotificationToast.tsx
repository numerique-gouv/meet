import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RoomEvent } from 'livekit-client'
import { ToastProvider, toastQueue } from './components/ToastProvider'
import { NotificationType } from './NotificationType'
import { Div } from '@/primitives'

export const MainNotificationToast = () => {
  const room = useRoomContext()
  // fixme - remove toast if the user quit room in the 5s she joined
  // fixme - don't show toast on mobile screen
  useEffect(() => {
    const showJoinNotification = (participant: Participant) => {
      toastQueue.add(
        {
          participant,
          type: NotificationType.Joined,
        },
        {
          timeout: 5000,
        }
      )
    }
    room.on(RoomEvent.ParticipantConnected, showJoinNotification)
    return () => {
      room.off(RoomEvent.ParticipantConnected, showJoinNotification)
    }
  }, [room])

  return (
    <Div position="absolute" bottom={20} right={5} zIndex={1000}>
      <ToastProvider />
    </Div>
  )
}
