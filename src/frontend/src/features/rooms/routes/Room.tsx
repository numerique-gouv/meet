import { useState } from 'react'
import {
  usePersistentUserChoices,
  type LocalUserChoices,
} from '@livekit/components-react'
import { useParams } from 'wouter'
import { Screen } from '@/layout/Screen'
import { ErrorScreen } from '@/layout/ErrorScreen'
import { useUser } from '@/features/auth'
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
      <Screen>
        <Join onSubmit={setUserConfig} />
      </Screen>
    )
  }

  return (
    <Screen>
      <Conference
        roomId={roomId}
        mode={mode}
        userConfig={{
          ...existingUserChoices,
          ...(skipJoinScreen ? { username: user?.email as string } : {}),
          ...userConfig,
        }}
      />
    </Screen>
  )
}
