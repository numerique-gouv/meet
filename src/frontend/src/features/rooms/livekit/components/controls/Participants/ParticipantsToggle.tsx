import { useTranslation } from 'react-i18next'
import { RiGroupLine, RiInfinityLine } from '@remixicon/react'
import { Button } from '@/primitives'
import { css } from '@/styled-system/css'
import { useParticipants } from '@livekit/components-react'
import { useState } from 'react'

export const ParticipantsToggle = () => {
  const { t } = useTranslation('rooms')

  /**
   * Context could not be used due to inconsistent refresh behavior.
   * The 'numParticipant' property on the room only updates when the room's metadata changes,
   * resulting in a delay compared to the participant list's actual refresh rate.
   */
  const participants = useParticipants()
  const numParticipants = participants?.length

  const [isOpen, setIsOpen] = useState(false)
  const tooltipLabel = isOpen ? 'open' : 'closed'

  return (
    <div
      className={css({
        position: 'relative',
        display: 'inline-block',
      })}
    >
      <Button
        toggle
        square
        legacyStyle
        aria-label={t(`controls.participants.${tooltipLabel}`)}
        tooltip={t(`controls.participants.${tooltipLabel}`)}
        onPress={() => setIsOpen(!isOpen)}
      >
        <RiGroupLine />
      </Button>
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
