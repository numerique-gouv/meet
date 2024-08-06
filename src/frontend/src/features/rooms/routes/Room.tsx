import { useState } from 'react'
import { useParams } from 'wouter'
import { ErrorScreen } from '@/components/ErrorScreen'
import { useUser, UserAware } from '@/features/auth'
import { Conference } from '../components/Conference'
import { HomemadeJoin } from '../components/HomemadeJoin'
import { settingsStore, type SettingsState } from '@/features/settings'
import { useSnapshot } from 'valtio'

export const Room = () => {
  const { isLoggedIn } = useUser()
  const settingsSnap = useSnapshot(settingsStore)
  const existingUserConfig = {
    username: settingsSnap.username,
    devices: settingsSnap.devices,
  }
  const [userConfig, setUserConfig] = useState<null | {
    username: SettingsState['username']
    devices: SettingsState['devices']
  }>(null)

  const { roomId } = useParams()
  const initialRoomData = history.state?.initialRoomData
  const mode = isLoggedIn && history.state?.create ? 'create' : 'join'
  const skipJoinScreen = isLoggedIn && mode === 'create'

  if (!roomId) {
    return <ErrorScreen />
  }

  if (!userConfig && !skipJoinScreen) {
    return (
      <UserAware>
        <HomemadeJoin onSubmit={setUserConfig} />
      </UserAware>
    )
  }

  return (
    <UserAware>
      <Conference
        initialRoomData={initialRoomData}
        roomId={roomId}
        mode={mode}
        userConfig={{
          ...existingUserConfig,
          ...userConfig,
        }}
      />
    </UserAware>
  )
}
