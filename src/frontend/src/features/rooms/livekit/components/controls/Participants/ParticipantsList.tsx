import { css } from '@/styled-system/css'
import { useParticipants } from '@livekit/components-react'

import { Heading } from 'react-aria-components'
import { Box, Button, Div } from '@/primitives'
import { text } from '@/primitives/Text'
import { RiCloseLine } from '@remixicon/react'
import { participantsStore } from '@/stores/participants'
import { useTranslation } from 'react-i18next'
import { allParticipantRoomEvents } from '@/features/rooms/livekit/constants/events'
import { ParticipantListItem } from '@/features/rooms/livekit/components/controls/Participants/ParticipantListItem'
import { VStack } from '@/styled-system/jsx'

// TODO: Optimize rendering performance, especially for longer participant lists, even though they are generally short.
export const ParticipantsList = () => {
  const { t } = useTranslation('rooms')

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

  // TODO - extract inline styling in a centralized styling file, and avoid magic numbers
  return (
    <Box
      size="sm"
      minWidth="300px"
      className={css({
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: '1.5rem 1.5rem 1.5rem 0',
      })}
    >
      <Heading slot="title" level={3} className={text({ variant: 'h2' })}>
        <span>{t('participants.heading')}</span>{' '}
        <span
          className={css({
            marginLeft: '0.75rem',
            fontWeight: 'normal',
            fontSize: '1rem',
          })}
        >
          {participants?.length}
        </span>
      </Heading>
      <Div position="absolute" top="5" right="5">
        <Button
          invisible
          size="xs"
          onPress={() => (participantsStore.showParticipants = false)}
          aria-label={t('participants.closeButton')}
          tooltip={t('participants.closeButton')}
        >
          <RiCloseLine />
        </Button>
      </Div>
      {sortedParticipants?.length > 0 && (
        <VStack
          role="list"
          className={css({
            alignItems: 'start',
            gap: 'none',
            overflowY: 'scroll',
            overflowX: 'hidden',
            minHeight: 0,
            flexGrow: 1,
            display: 'flex',
          })}
        >
          {sortedParticipants.map((participant) => (
            <ParticipantListItem participant={participant} />
          ))}
        </VStack>
      )}
    </Box>
  )
}
