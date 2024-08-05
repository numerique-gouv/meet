import { useTranslation } from 'react-i18next'
import { RiGroupLine, RiInfinityLine } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useLayoutContext, useParticipants } from '@livekit/components-react'
import { useSnapshot } from 'valtio'
import { participantsStore } from '@/stores/participants'

export const ParticipantsToggle = () => {
  const { t } = useTranslation('rooms')

  const { dispatch, state } = useLayoutContext().widget

  /**
   * Context could not be used due to inconsistent refresh behavior.
   * The 'numParticipant' property on the room only updates when the room's metadata changes,
   * resulting in a delay compared to the participant list's actual refresh rate.
   */
  const participants = useParticipants()
  const numParticipants = participants?.length

  const participantsSnap = useSnapshot(participantsStore)
  const showParticipants = participantsSnap.showParticipants

  const tooltipLabel = showParticipants ? 'open' : 'closed'

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
        aria-label={t(`controls.participants.${tooltipLabel}`)}
        tooltip={t(`controls.participants.${tooltipLabel}`)}
        isSelected={showParticipants}
        onPress={() => {
          if (dispatch && state?.showChat) dispatch({ msg: 'toggle_chat' })
          participantsStore.showParticipants = !showParticipants
        }}
      >
        <RiGroupLine />
      </ToggleButton>
      <div
        className={css({
          position: 'absolute',
          top: '-.25rem',
          right: '-.25rem',
          width: '1.25rem',
          height: '1.25rem',
          backgroundColor: 'gray',
          borderRadius: '50%',
          color: 'white',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          zIndex: 1,
          userSelect: 'none',
        })}
      >
        {numParticipants < 100 ? (
          numParticipants || 1
        ) : (
          <RiInfinityLine size={10} />
        )}
      </div>
    </div>
  )
}
