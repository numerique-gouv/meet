import { useEffect, useRef } from 'react'
import { useLocalParticipant } from '@livekit/components-react'
import { LocalVideoTrack } from 'livekit-client'
import { Div, P } from '@/primitives'
import { useTranslation } from 'react-i18next'

export const Effects = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'effects' })
  const { isCameraEnabled, cameraTrack } = useLocalParticipant()
  const videoRef = useRef<HTMLVideoElement>(null)

  const localCameraTrack = cameraTrack?.track as LocalVideoTrack

  useEffect(() => {
    const videoElement = videoRef.current

    const attachVideoTrack = async () => {
      if (!videoElement) return
      localCameraTrack?.attach(videoElement)
    }

    attachVideoTrack()

    return () => {
      if (!videoElement) return
      localCameraTrack.detach(videoElement)
    }
  }, [localCameraTrack, isCameraEnabled])

  return (
    <Div padding="0 1.5rem">
      {localCameraTrack && isCameraEnabled ? (
        <video
          ref={videoRef}
          width="100%"
          muted
          style={{
            transform: 'rotateY(180deg)',
            minHeight: '173px',
            borderRadius: '4px',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '174px',
            display: 'flex',
            backgroundColor: 'black',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <P
            style={{
              color: 'white',
              textAlign: 'center',
              textWrap: 'balance',
              marginBottom: 0,
            }}
          >
            {t('activateCamera')}
          </P>
        </div>
      )}
    </Div>
  )
}
