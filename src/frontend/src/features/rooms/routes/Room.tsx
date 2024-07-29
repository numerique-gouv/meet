import { useState } from 'react'
import {
  usePersistentUserChoices,
  type LocalUserChoices,
} from '@livekit/components-react'
import { useParams } from 'wouter'
import { ErrorScreen } from '@/components/ErrorScreen'
import { useUser, UserAware } from '@/features/auth'
import { Conference } from '../components/Conference'
import { Join } from '../components/Join'

export const Room = () => {
  const { user, isLoggedIn } = useUser()
  const { userChoices: existingUserChoices } = usePersistentUserChoices()
  const [userConfig, setUserConfig] = useState<LocalUserChoices | null>(null)

  const { roomId } = useParams()
  const mode = isLoggedIn && history.state?.create ? 'create' : 'join'
  const skipJoinScreen = isLoggedIn && mode === 'create'

  if (!roomId) {
    return <ErrorScreen />
  }

  if (!userConfig && !skipJoinScreen) {
    return (
      <UserAware>
        <Join onSubmit={setUserConfig} />
      </UserAware>
    )
  }

  return (
    <UserAware>
      <Conference
        roomId={roomId}
        mode={mode}
        userConfig={{
          ...existingUserChoices,
          ...(skipJoinScreen ? { username: user?.email as string } : {}),
          ...userConfig,
        }}
      />
    </UserAware>
  )
}
