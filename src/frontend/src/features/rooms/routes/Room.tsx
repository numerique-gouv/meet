import { type LocalUserChoices } from '@livekit/components-react'
import { useState } from 'react'
import { Conference } from '../components/Conference'
import { Join } from '../components/Join'
import { Screen } from '@/layout/Screen'

export const Room = () => {
  const [userConfig, setUserConfig] = useState<LocalUserChoices | null>(null)
  return (
    <Screen>
      {userConfig ? (
        <Conference userConfig={userConfig} />
      ) : (
        <Join onSubmit={setUserConfig} />
      )}
    </Screen>
  )
}
