import { useTranslation } from 'react-i18next'
import { RiHand } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useRoomContext } from '@livekit/components-react'
import { useRaisedHand } from '@/features/rooms/livekit/hooks/useRaisedHand'
import { NotificationType } from '@/features/notifications/NotificationType'

export const HandToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.hand' })

  const room = useRoomContext()
  const { isHandRaised, toggleRaisedHand } = useRaisedHand({
    participant: room.localParticipant,
  })

  const tooltipLabel = isHandRaised ? 'lower' : 'raise'

  const notifyOtherParticipants = (isHandRaised: boolean) => {
    room.localParticipant.publishData(
      new TextEncoder().encode(
        !isHandRaised ? NotificationType.Raised : NotificationType.Lowered
      ),
      {
        reliable: true,
      }
    )
  }

  return (
    <div
      className={css({
        position: 'relative',
        display: 'inline-block',
      })}
    >
      <ToggleButton
        square
        legacyStyle
        aria-label={t(tooltipLabel)}
        tooltip={t(tooltipLabel)}
        isSelected={isHandRaised}
        onPress={() => {
          notifyOtherParticipants(isHandRaised)
          toggleRaisedHand()
        }}
        data-attr={`controls-hand-${tooltipLabel}`}
      >
        <RiHand />
      </ToggleButton>
    </div>
  )
}
