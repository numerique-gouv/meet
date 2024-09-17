import { useTranslation } from 'react-i18next'
import { RiChat1Line } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useWidgetInteraction } from '../../hooks/useWidgetInteraction'

export const ChatToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.chat' })

  const { isChatOpen, unreadMessages, toggleChat } = useWidgetInteraction()
  const tooltipLabel = isChatOpen ? 'open' : 'closed'

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
        isSelected={isChatOpen}
        onPress={() => toggleChat()}
      >
        <RiChat1Line />
      </ToggleButton>
      {!!unreadMessages && (
        <div
          className={css({
            position: 'absolute',
            top: '-.25rem',
            right: '-.25rem',
            width: '1rem',
            height: '1rem',
            backgroundColor: 'red',
            borderRadius: '50%',
            zIndex: 1,
            border: '2px solid #d1d5db',
          })}
        />
      )}
    </div>
  )
}
