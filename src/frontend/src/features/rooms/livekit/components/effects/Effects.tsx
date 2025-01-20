import { useLocalParticipant } from '@livekit/components-react'
import { LocalVideoTrack } from 'livekit-client'
import { css } from '@/styled-system/css'
import { EffectsConfiguration } from './EffectsConfiguration'

export const Effects = () => {
  const { cameraTrack } = useLocalParticipant()
  const localCameraTrack = cameraTrack?.track as LocalVideoTrack
  return (
    <div
      className={css({
        padding: '0 1.5rem',
      })}
    >
      <EffectsConfiguration videoTrack={localCameraTrack} layout="vertical" />
    </div>
  )
}
