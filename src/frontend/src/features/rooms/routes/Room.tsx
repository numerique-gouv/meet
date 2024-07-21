import { type LocalUserChoices } from '@livekit/components-react'
import { useState } from 'react'
import { useParams } from 'wouter'
import { Conference } from '../components/Conference'
import { Join } from '../components/Join'
import { Screen } from '@/layout/Screen'
import { ErrorScreen } from '@/layout/ErrorScreen'

export const Room = () => {
  const [userConfig, setUserConfig] = useState<LocalUserChoices | null>(null)
  const { roomId } = useParams()
  if (!roomId) {
    return <ErrorScreen />
  }
  return (
    <Screen>
      {userConfig ? (
        <Conference roomId={roomId} userConfig={userConfig} />
      ) : (
        <Join onSubmit={setUserConfig} />
      )}
    </Screen>
  )
}
