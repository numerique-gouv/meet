import { LocalVideoTrack, Track, TrackProcessor } from 'livekit-client'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BackgroundBlurFactory,
  BackgroundBlurProcessorInterface,
} from '../blur'
import { css } from '@/styled-system/css'
import { Text, P, ToggleButton, H } from '@/primitives'
import { HStack, styled } from '@/styled-system/jsx'

enum BlurRadius {
  NONE = 0,
  LIGHT = 5,
  NORMAL = 10,
}

const isSupported = BackgroundBlurFactory.isSupported()

const Information = styled('div', {
  base: {
    backgroundColor: 'orange.50',
    borderRadius: '4px',
    padding: '0.75rem 0.75rem',
    marginTop: '0.8rem',
    alignItems: 'start',
  },
})

export const EffectsConfiguration = ({
  videoTrack,
  onSubmit,
  layout = 'horizontal',
}: {
  videoTrack: LocalVideoTrack
  onSubmit?: (processor?: TrackProcessor<Track.Kind.Video>) => void
  layout?: 'vertical' | 'horizontal'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { t } = useTranslation('rooms', { keyPrefix: 'effects' })
  const [processorPending, setProcessorPending] = useState(false)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const attachVideoTrack = async () => videoTrack?.attach(videoElement)
    attachVideoTrack()

    return () => {
      if (!videoElement) return
      videoTrack.detach(videoElement)
    }
  }, [videoTrack, videoTrack?.isMuted])

  const toggleBlur = async (blurRadius: number) => {
    if (!videoTrack) return
    setProcessorPending(true)
    const processor = getProcessor()
    const currentBlurRadius = getBlurRadius()
    try {
      if (blurRadius == currentBlurRadius && processor) {
        await videoTrack.stopProcessor()
        onSubmit?.(undefined)
      } else if (!processor) {
        const newProcessor = BackgroundBlurFactory.getProcessor({ blurRadius })!
        await videoTrack.setProcessor(newProcessor)
        onSubmit?.(newProcessor)
      } else {
        processor?.update({ blurRadius })
      }
    } catch (error) {
      console.error('Error applying blur:', error)
    } finally {
      setProcessorPending(false)
    }
  }

  const getProcessor = () => {
    return videoTrack?.getProcessor() as BackgroundBlurProcessorInterface
  }

  const getBlurRadius = (): BlurRadius => {
    const processor = getProcessor()
    return processor?.options.blurRadius || BlurRadius.NONE
  }

  const isSelected = (blurRadius: BlurRadius) => {
    return getBlurRadius() == blurRadius
  }

  const tooltipLabel = (blurRadius: BlurRadius) => {
    return t(`blur.${isSelected(blurRadius) ? 'clear' : 'apply'}`)
  }

  return (
    <div
      className={css(
        layout === 'vertical'
          ? {
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }
          : {
              display: 'flex',
              gap: '1.5rem',
              flexDirection: 'column',
              md: {
                flexDirection: 'row',
              },
            }
      )}
    >
      <div
        className={css({
          width: '100%',
          aspectRatio: 16 / 9,
        })}
      >
        {videoTrack && !videoTrack.isMuted ? (
          <video
            ref={videoRef}
            width="100%"
            muted
            style={{
              transform: 'rotateY(180deg)',
              minHeight: '175px',
              borderRadius: '8px',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
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
      </div>
      <div
        className={css(
          layout === 'horizontal'
            ? {
                md: {
                  borderLeft: '1px solid #dadce0',
                  paddingLeft: '1.5rem',
                },
              }
            : {}
        )}
      >
        <H
          lvl={3}
          style={{
            marginBottom: '0.4rem',
            fontWeight: 'bold',
          }}
        >
          {t('heading')}
        </H>
        {isSupported ? (
          <HStack>
            <ToggleButton
              size={'sm'}
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
        <Information>
          <Text variant="sm">⚠︎ {t('experimental')}</Text>
        </Information>
      </div>
    </div>
  )
}
