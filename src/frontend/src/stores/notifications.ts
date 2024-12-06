import { proxy, subscribe } from 'valtio'
import { proxyMap } from 'valtio/utils'
import { deserializeToProxyMap, serializeProxyMap } from '@/utils/valtio'
import { STORAGE_KEYS } from '@/utils/storageKeys'
import { NotificationType } from '@/features/notifications/NotificationType'

type State = {
  soundNotifications: Map<NotificationType, boolean>
  soundNotificationVolume: number
}

const DEFAULT_STATE: State = {
  soundNotifications: proxyMap(
    new Map([
      [NotificationType.ParticipantJoined, true],
      [NotificationType.HandRaised, true],
    ])
  ),
  soundNotificationVolume: 0.1,
}

function getNotificationsState(): State {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    if (!stored) return DEFAULT_STATE
    const parsed = JSON.parse(stored, deserializeToProxyMap)
    return parsed || DEFAULT_STATE
  } catch (error: unknown) {
    console.error(
      '[NotificationsStore] Failed to parse stored settings:',
      error
    )
    return DEFAULT_STATE
  }
}

export const notificationsStore = proxy<State>(getNotificationsState())

subscribe(notificationsStore, () => {
  localStorage.setItem(
    STORAGE_KEYS.NOTIFICATIONS,
    JSON.stringify(notificationsStore, serializeProxyMap)
  )
})
