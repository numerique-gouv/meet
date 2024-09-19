import { useEffect, useRef, useState } from 'react'
import { useLocalParticipant } from '@livekit/components-react'
import { LocalVideoTrack } from 'livekit-client'
import { Text, P, ToggleButton } from '@/primitives'
import { useTranslation } from 'react-i18next'
import { HStack, VStack } from '@/styled-system/jsx'
import {
  BackgroundBlur,
  BackgroundOptions,
  ProcessorWrapper,
  BackgroundTransformer,
} from '@livekit/track-processors'

enum BlurRadius {
  NONE = 0,
  LIGHT = 5,
  NORMAL = 10,
}

export const Effects = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'effects' })
  const { isCameraEnabled, cameraTrack, localParticipant } =
    useLocalParticipant()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [processorPending, setProcessorPending] = useState(false)

  const localCameraTrack = cameraTrack?.track as LocalVideoTrack

  const getProcessor = () => {
    return localCameraTrack?.getProcessor() as ProcessorWrapper<BackgroundOptions>
  }

  const getBlurRadius = (): BlurRadius => {
    const processor = getProcessor()
    return (
      (processor?.transformer as BackgroundTransformer)?.options?.blurRadius ||
      BlurRadius.NONE
    )
  }

  const toggleBlur = async (blurRadius: number) => {
    if (!isCameraEnabled) await localParticipant.setCameraEnabled(true)
    if (!localCameraTrack) return

    setProcessorPending(true)

    const processor = getProcessor()
    const currentBlurRadius = getBlurRadius()

    try {
      if (blurRadius == currentBlurRadius && processor) {
        await localCameraTrack.stopProcessor()
      } else if (!processor) {
        await localCameraTrack.setProcessor(BackgroundBlur(blurRadius))
      } else {
        await processor?.updateTransformerOptions({ blurRadius })
      }
    } catch (error) {
      console.error('Error applying blur:', error)
    } finally {
      setProcessorPending(false)
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const attachVideoTrack = async () => localCameraTrack?.attach(videoElement)
    attachVideoTrack()

    return () => {
      if (!videoElement) return
      localCameraTrack.detach(videoElement)
    }
  }, [localCameraTrack, isCameraEnabled])

  const isSelected = (blurRadius: BlurRadius) => {
    return isCameraEnabled && getBlurRadius() == blurRadius
  }

  const tooltipLabel = (blurRadius: BlurRadius) => {
    return t(`blur.${isSelected(blurRadius) ? 'clear' : 'apply'}`)
  }

  return (
    <VStack padding="0 1.5rem">
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
      {ProcessorWrapper.isSupported ? (
        <HStack>
          <ToggleButton
            size={'sm'}
            legacyStyle
            aria-label={tooltipLabel(BlurRadius.LIGHT)}
            tooltip={tooltipLabel(BlurRadius.LIGHT)}
            isDisabled={processorPending}
            onPress={async () => await toggleBlur(BlurRadius.LIGHT)}
            isSelected={isSelected(BlurRadius.LIGHT)}
          >
            {t('blur.light')}
          </ToggleButton>
          <ToggleButton
            size={'sm'}
            legacyStyle
            aria-label={tooltipLabel(BlurRadius.NORMAL)}
            tooltip={tooltipLabel(BlurRadius.NORMAL)}
            isDisabled={processorPending}
            onPress={async () => await toggleBlur(BlurRadius.NORMAL)}
            isSelected={isSelected(BlurRadius.NORMAL)}
          >
            {t('blur.normal')}
          </ToggleButton>
        </HStack>
      ) : (
        <Text variant="sm">{t('notAvailable')}</Text>
      )}
    </VStack>
  )
}
