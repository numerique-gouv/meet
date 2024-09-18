import { css } from '@/styled-system/css'
import { useParticipants } from '@livekit/components-react'

import { Div, H } from '@/primitives'
import { useTranslation } from 'react-i18next'
import { allParticipantRoomEvents } from '@/features/rooms/livekit/constants/events'
import { ParticipantListItem } from '../../controls/Participants/ParticipantListItem'
import { ParticipantsCollapsableList } from '../../controls/Participants/ParticipantsCollapsableList'
import { HandRaisedListItem } from '../../controls/Participants/HandRaisedListItem'
import { LowerAllHandsButton } from '../../controls/Participants/LowerAllHandsButton'

// TODO: Optimize rendering performance, especially for longer participant lists, even though they are generally short.
export const ParticipantsList = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'participants' })

  // Preferred using the 'useParticipants' hook rather than the separate remote and local hooks,
  // because the 'useLocalParticipant' hook does not update the participant's information when their
  // metadata/name changes. The LiveKit team has marked this as a TODO item in the code.
  const participants = useParticipants({
    updateOnlyOn: allParticipantRoomEvents,
  })

  const sortedRemoteParticipants = participants
    .slice(1)
    .sort((participantA, participantB) => {
      const nameA = participantA.name || participantA.identity
      const nameB = participantB.name || participantB.identity
      return nameA.localeCompare(nameB)
    })

  const sortedParticipants = [
    participants[0], // first participant returned by the hook, is always the local one
    ...sortedRemoteParticipants,
  ]

  const raisedHandParticipants = participants.filter((participant) => {
    const data = JSON.parse(participant.metadata || '{}')
    return data.raised
  })

  // TODO - extract inline styling in a centralized styling file, and avoid magic numbers
  return (
    <>
      <H
        lvl={2}
        className={css({
          fontSize: '0.875rem',
          fontWeight: 'bold',
          color: '#5f6368',
          padding: '0 1.5rem',
          marginBottom: '0.83em',
        })}
      >
        {t('subheading').toUpperCase()}
      </H>
      {raisedHandParticipants.length > 0 && (
        <Div marginBottom=".9375rem">
          <ParticipantsCollapsableList
            heading={t('raisedHands')}
            participants={raisedHandParticipants}
            renderParticipant={(participant) => (
              <HandRaisedListItem participant={participant} />
            )}
            action={() => (
              <LowerAllHandsButton participants={raisedHandParticipants} />
            )}
          />
        </Div>
      )}
      <ParticipantsCollapsableList
        heading={t('contributors')}
        participants={sortedParticipants}
        renderParticipant={(participant) => (
          <ParticipantListItem participant={participant} />
        )}
      />
    </>
  )
}
