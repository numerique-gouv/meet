import { useTranslation } from 'react-i18next'
import { RiChat1Line } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useLayoutContext } from '@livekit/components-react'
import { useSnapshot } from 'valtio'
import { participantsStore } from '@/stores/participants'

export const ChatToggle = () => {
  const { t } = useTranslation('rooms')

  const { dispatch, state } = useLayoutContext().widget
  const tooltipLabel = state?.showChat ? 'open' : 'closed'

  const participantsSnap = useSnapshot(participantsStore)
  const showParticipants = participantsSnap.showParticipants

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
        aria-label={t(`controls.chat.${tooltipLabel}`)}
        tooltip={t(`controls.chat.${tooltipLabel}`)}
        isSelected={state?.showChat}
        onPress={() => {
          if (showParticipants) participantsStore.showParticipants = false
          if (dispatch) dispatch({ msg: 'toggle_chat' })
        }}
      >
        <RiChat1Line />
      </ToggleButton>
      {!!state?.unreadMessages && (
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
