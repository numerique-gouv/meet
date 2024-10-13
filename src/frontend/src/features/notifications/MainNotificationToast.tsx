import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RoomEvent } from 'livekit-client'
import { ToastProvider, toastQueue } from './components/ToastProvider'
import { NotificationType } from './NotificationType'
import { Div } from '@/primitives'
import { isMobileBrowser } from '@livekit/components-core'
import { useNotificationSound } from '@/features/notifications/hooks/useSoundNotification'

export const MainNotificationToast = () => {
  const room = useRoomContext()
  const { triggerNotificationSound } = useNotificationSound()

  useEffect(() => {
    const showJoinNotification = (participant: Participant) => {
      if (isMobileBrowser()) {
        return
      }
      triggerNotificationSound(NotificationType.Joined)
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
  }, [room, triggerNotificationSound])

  useEffect(() => {
    const removeParticipantNotifications = (participant: Participant) => {
      toastQueue.visibleToasts.forEach((toast) => {
        if (toast.content.participant === participant) {
          toastQueue.close(toast.key)
        }
      })
    }
    room.on(RoomEvent.ParticipantDisconnected, removeParticipantNotifications)
    return () => {
      room.off(
        RoomEvent.ParticipantDisconnected,
        removeParticipantNotifications
      )
    }
  }, [room])

  useEffect(() => {
    const handleNotificationReceived = (
      prevMetadataStr: string | undefined,
      participant: Participant
    ) => {
      if (!participant) return
      if (isMobileBrowser()) return
      if (participant.isLocal) return

      const prevMetadata = JSON.parse(prevMetadataStr || '{}')
      const metadata = JSON.parse(participant.metadata || '{}')

      if (prevMetadata.raised == metadata.raised) return

      const existingToast = toastQueue.visibleToasts.find(
        (toast) =>
          toast.content.participant === participant &&
          toast.content.type === NotificationType.Raised
      )

      if (existingToast && prevMetadata.raised && !metadata.raised) {
        toastQueue.close(existingToast.key)
        return
      }

      if (!existingToast && !prevMetadata.raised && metadata.raised) {
        triggerNotificationSound(NotificationType.Raised)
        toastQueue.add(
          {
            participant,
            type: NotificationType.Raised,
          },
          { timeout: 5000 }
        )
      }
    }

    room.on(RoomEvent.ParticipantMetadataChanged, handleNotificationReceived)

    return () => {
      room.off(RoomEvent.ParticipantMetadataChanged, handleNotificationReceived)
    }
  }, [room, triggerNotificationSound])

  useEffect(() => {
    const closeAllToasts = () => {
      toastQueue.visibleToasts.forEach(({ key }) => toastQueue.close(key))
    }
    room.on(RoomEvent.Disconnected, closeAllToasts)
    return () => {
      room.off(RoomEvent.Disconnected, closeAllToasts)
    }
  }, [room])

  return (
    <Div position="absolute" bottom={20} right={5} zIndex={1000}>
      <ToastProvider />
    </Div>
  )
}
