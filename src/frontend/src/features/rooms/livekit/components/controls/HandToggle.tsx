import { useTranslation } from 'react-i18next'
import { RiHand } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import {
  useLocalParticipant,
  useParticipantInfo,
} from '@livekit/components-react'

export const HandToggle = () => {
  const { t } = useTranslation('rooms')

  const localParticipant = useLocalParticipant().localParticipant
  const { metadata } = useParticipantInfo({ participant: localParticipant })

  const parsedMetadata = JSON.parse(metadata || '{}')

  const sendRaise = () => {
    parsedMetadata.raised = !parsedMetadata.raised
    localParticipant.setMetadata(JSON.stringify(parsedMetadata))
  }

  const label = parsedMetadata.raised
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
        isSelected={parsedMetadata.raised}
        onPress={() => sendRaise()}
      >
        <RiHand />
      </ToggleButton>
    </div>
  )
}
