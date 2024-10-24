import { useTranslation } from 'react-i18next'
import { RiGroupLine, RiInfinityLine } from '@remixicon/react'
import { ToggleButton } from '@/primitives'
import { css } from '@/styled-system/css'
import { useParticipants } from '@livekit/components-react'
import { useSidePanel } from '../../../hooks/useSidePanel'

export const ParticipantsToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.participants' })

  /**
   * Context could not be used due to inconsistent refresh behavior.
   * The 'numParticipant' property on the room only updates when the room's metadata changes,
   * resulting in a delay compared to the participant list's actual refresh rate.
   */
  const participants = useParticipants()
  const numParticipants = participants?.length

  const { isParticipantsOpen, toggleParticipants } = useSidePanel()

  const tooltipLabel = isParticipantsOpen ? 'open' : 'closed'

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
        isSelected={isParticipantsOpen}
        onPress={() => toggleParticipants()}
        data-attr={`controls-participants-${tooltipLabel}`}
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
