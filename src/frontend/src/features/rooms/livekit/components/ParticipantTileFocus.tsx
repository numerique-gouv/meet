import { css } from '@/styled-system/css'
import { HStack } from '@/styled-system/jsx'
import { Button } from '@/primitives'
import { RiPushpin2Line, RiUnpinLine } from '@remixicon/react'
import { useFocusToggle } from '@livekit/components-react'
import { useTranslation } from 'react-i18next'
import { TrackReferenceOrPlaceholder } from '@livekit/components-core'
import { useEffect, useState } from 'react'

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
          </HStack>
        </div>
      )}
    </div>
  )
}
