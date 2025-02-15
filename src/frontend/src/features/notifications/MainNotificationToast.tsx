import { useEffect } from 'react'
import { useRoomContext } from '@livekit/components-react'
import { Participant, RemoteParticipant, RoomEvent } from 'livekit-client'
import { ToastProvider, toastQueue } from './components/ToastProvider'
import { NotificationType } from './NotificationType'
import { Div } from '@/primitives'
import { ChatMessage, isMobileBrowser } from '@livekit/components-core'
import { useNotificationSound } from '@/features/notifications/hooks/useSoundNotification'

enum ToastDuration {
  SHORT = 3000,
  MEDIUM = 4000,
  LONG = 5000,
}

const NotificationDuration = {
  ALERT: ToastDuration.SHORT,
  MESSAGE: ToastDuration.LONG,
  PARTICIPANT_JOINED: ToastDuration.LONG,
  HAND_RAISED: ToastDuration.LONG,
} as const

export const MainNotificationToast = () => {
  const room = useRoomContext()
  const { triggerNotificationSound } = useNotificationSound()

  useEffect(() => {
    const handleChatMessage = (
      chatMessage: ChatMessage,
      participant?: Participant | undefined
    ) => {
      if (!participant || participant.isLocal) return
      triggerNotificationSound(NotificationType.MessageReceived)
      toastQueue.add(
        {
          participant: participant,
          message: chatMessage.message,
          type: NotificationType.MessageReceived,
        },
        { timeout: NotificationDuration.MESSAGE }
      )
    }
    room.on(RoomEvent.ChatMessage, handleChatMessage)
    return () => {
      room.off(RoomEvent.ChatMessage, handleChatMessage)
    }
  }, [room, triggerNotificationSound])

  useEffect(() => {
    const handleDataReceived = (
      payload: Uint8Array,
      participant?: RemoteParticipant
    ) => {
      const decoder = new TextDecoder()
      const notificationType = decoder.decode(payload)

      if (!participant) return

      switch (notificationType) {
        case NotificationType.ParticipantMuted:
          toastQueue.add(
            {
              participant,
              type: NotificationType.ParticipantMuted,
            },
            { timeout: NotificationDuration.ALERT }
          )
          break
        default:
          return
      }
    }
    room.on(RoomEvent.DataReceived, handleDataReceived)
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
    }
  }, [room])

  useEffect(() => {
    const showJoinNotification = (participant: Participant) => {
      if (isMobileBrowser()) {
        return
      }
      triggerNotificationSound(NotificationType.ParticipantJoined)
      toastQueue.add(
        {
          participant,
          type: NotificationType.ParticipantJoined,
        },
        {
          timeout: NotificationDuration.PARTICIPANT_JOINED,
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
          toast.content.type === NotificationType.HandRaised
      )

      if (existingToast && prevMetadata.raised && !metadata.raised) {
        toastQueue.close(existingToast.key)
        return
      }

      if (!existingToast && !prevMetadata.raised && metadata.raised) {
        triggerNotificationSound(NotificationType.HandRaised)
        toastQueue.add(
          {
            participant,
            type: NotificationType.HandRaised,
          },
          { timeout: NotificationDuration.HAND_RAISED }
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
    <Div position="absolute" bottom={0} right={5} zIndex={1000}>
      <ToastProvider />
    </Div>
  )
}
