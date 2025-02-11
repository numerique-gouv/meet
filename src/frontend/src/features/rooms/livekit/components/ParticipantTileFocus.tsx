import { css } from '@/styled-system/css'
import { HStack } from '@/styled-system/jsx'
import { Button } from '@/primitives'
import {
  RiFullscreenLine,
  RiImageCircleAiFill,
  RiMicLine,
  RiMicOffLine,
  RiPushpin2Line,
  RiUnpinLine,
} from '@remixicon/react'
import {
  useFocusToggle,
  useTrackMutedIndicator,
} from '@livekit/components-react'
import { useTranslation } from 'react-i18next'
import { TrackReferenceOrPlaceholder } from '@livekit/components-core'
import { useEffect, useState } from 'react'
import { useSidePanel } from '../hooks/useSidePanel'
import { useFullScreen } from '../hooks/useFullScreen'
import { Participant, Track } from 'livekit-client'
import { MuteAlertDialog } from './MuteAlertDialog'
import { useMuteParticipant } from '../api/muteParticipant'

const ZoomButton = ({
  trackRef,
}: {
  trackRef: TrackReferenceOrPlaceholder
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'participantTileFocus' })
  const { toggleFullScreen, isFullscreenAvailable } = useFullScreen({
    trackRef,
  })

  if (!isFullscreenAvailable) {
    return
  }

  return (
    <Button
      size="sm"
      variant="primaryTextDark"
      square
      tooltip={t('fullScreen')}
      onPress={() => toggleFullScreen()}
    >
      <RiFullscreenLine />
    </Button>
  )
}

const FocusButton = ({
  trackRef,
}: {
  trackRef: TrackReferenceOrPlaceholder
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'participantTileFocus' })
  const { mergedProps, inFocus } = useFocusToggle({
    trackRef,
    props: {},
  })
  return (
    <Button
      size="sm"
      variant="primaryTextDark"
      square
      tooltip={inFocus ? t('pin.disable') : t('pin.enable')}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onPress={(event) => mergedProps?.onClick?.(event as any)}
    >
      {inFocus ? <RiUnpinLine /> : <RiPushpin2Line />}
    </Button>
  )
}

const EffectsButton = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'participantTileFocus' })
  const { isEffectsOpen, toggleEffects } = useSidePanel()
  return (
    <Button
      size={'sm'}
      variant={'primaryTextDark'}
      square
      tooltip={t('effects')}
      onPress={() => !isEffectsOpen && toggleEffects()}
    >
      <RiImageCircleAiFill />
    </Button>
  )
}

const MuteButton = ({ participant }: { participant: Participant }) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'participantTileFocus' })

  const { isMuted } = useTrackMutedIndicator({
    participant: participant,
    source: Track.Source.Microphone,
  })

  const { muteParticipant } = useMuteParticipant()
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  const name = participant.name || participant.identity

  return (
    <>
      <Button
        isDisabled={isMuted}
        size={'sm'}
        variant={'primaryTextDark'}
        square
        onPress={() => setIsAlertOpen(true)}
        tooltip={t('muteParticipant', { name })}
      >
        {!isMuted ? <RiMicLine /> : <RiMicOffLine />}
      </Button>
      <MuteAlertDialog
        isOpen={isAlertOpen}
        onSubmit={() =>
          muteParticipant(participant).then(() => setIsAlertOpen(false))
        }
        onClose={() => setIsAlertOpen(false)}
        name={name}
      />
    </>
  )
}

export const ParticipantTileFocus = ({
  trackRef,
}: {
  trackRef: TrackReferenceOrPlaceholder
}) => {
  const [hovered, setHovered] = useState(false)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (hovered) {
      // Wait for next frame to ensure element is mounted
      requestAnimationFrame(() => {
        setOpacity(0.6)
      })
    } else {
      setOpacity(0)
    }
  }, [hovered])

  const participant = trackRef.participant

  const isScreenShare = trackRef.source == Track.Source.ScreenShare
  const isLocal = trackRef.participant.isLocal

  return (
    <div
      className={css({
        position: 'absolute',
        left: '0',
        top: '0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          className={css({
            backgroundColor: 'primaryDark.50',
            transition: 'opacity 200ms linear',
            zIndex: 1,
            borderRadius: '0.25rem',
            display: 'flex',
            _hover: {
              opacity: '0.95 !important',
            },
          })}
          style={{ opacity }}
        >
          <HStack
            gap={0.5}
            className={css({
              padding: '0.5rem',
              _hover: {
                opacity: '1 !important',
              },
            })}
          >
            <FocusButton trackRef={trackRef} />
            {!isScreenShare ? (
              <>
                {participant.isLocal ? (
                  <EffectsButton />
                ) : (
                  <MuteButton participant={participant} />
                )}
              </>
            ) : (
              !isLocal && <ZoomButton trackRef={trackRef} />
            )}
          </HStack>
        </div>
      )}
    </div>
  )
}
