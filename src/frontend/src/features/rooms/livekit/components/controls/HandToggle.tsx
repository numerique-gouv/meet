import { useTranslation } from 'react-i18next'
import { RiHand } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useLocalParticipant } from '@livekit/components-react'
import { useRaisedHand } from '@/features/rooms/livekit/hooks/useRaisedHand'

export const HandToggle = () => {
  const { t } = useTranslation('rooms')

  const localParticipant = useLocalParticipant().localParticipant
  const { isHandRaised, toggleRaisedHand } = useRaisedHand({
    participant: localParticipant,
  })

  const label = isHandRaised
    ? t('controls.hand.lower')
    : t('controls.hand.raise')

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
        aria-label={label}
        tooltip={label}
        isSelected={isHandRaised}
        onPress={() => toggleRaisedHand()}
      >
        <RiHand />
      </ToggleButton>
    </div>
  )
}
