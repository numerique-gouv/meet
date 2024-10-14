import { useTranslation } from 'react-i18next'
import { RiChat1Line } from '@remixicon/react'
import { useSnapshot } from 'valtio'
import { css } from '@/styled-system/css'
import { ToggleButton } from '@/primitives'
import { chatStore } from '@/stores/chat'
import { useSidePanel } from '../../hooks/useSidePanel'

export const ChatToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.chat' })

  const chatSnap = useSnapshot(chatStore)

  const { isChatOpen, toggleChat } = useSidePanel()
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
        data-attr={`controls-chat-${tooltipLabel}`}
      >
        <RiChat1Line />
      </ToggleButton>
      {!!chatSnap.unreadMessages && (
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
