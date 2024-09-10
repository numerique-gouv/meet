import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RemoteParticipant, RoomEvent } from 'livekit-client'
import { ToastProvider, toastQueue } from './components/ToastProvider'
import { NotificationType } from './NotificationType'
import { Div } from '@/primitives'

export const MainNotificationToast = () => {
  const room = useRoomContext()
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

  useEffect(() => {
    const removeJoinNotification = (participant: Participant) => {
      const existingToast = toastQueue.visibleToasts.find(
        (toast) =>
          toast.content.participant === participant &&
          toast.content.type === NotificationType.Joined
      )
      if (existingToast) {
        toastQueue.close(existingToast.key)
      }
    }
    room.on(RoomEvent.ParticipantDisconnected, removeJoinNotification)
    return () => {
      room.off(RoomEvent.ParticipantConnected, removeJoinNotification)
    }
  }, [room])

  // fixme - close all related toasters when hands are lowered remotely
  useEffect(() => {
    const decoder = new TextDecoder()

    const handleNotificationReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      if (!participant) {
        return
      }
      const notification = decoder.decode(payload)
      const existingToast = toastQueue.visibleToasts.find(
        (toast) =>
          toast.content.participant === participant &&
          toast.content.type === NotificationType.Raised
      )
      if (existingToast && notification === NotificationType.Lowered) {
        toastQueue.close(existingToast.key)
        return
      }
      if (!existingToast && notification === NotificationType.Raised) {
        toastQueue.add(
          {
            participant,
            type: NotificationType.Raised,
          },
          { timeout: 5000 }
        )
      }
    }

    room.on(RoomEvent.DataReceived, handleNotificationReceived)

    return () => {
      room.off(RoomEvent.DataReceived, handleNotificationReceived)
    }
  }, [room])

  return (
    <Div position="absolute" bottom={20} right={5} zIndex={1000}>
      <ToastProvider />
    </Div>
  )
}
