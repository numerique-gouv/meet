import { Participant } from 'livekit-client'
import { styled } from '@/styled-system/jsx'
import { Avatar } from '@/components/Avatar'

const StyledParticipantPlaceHolder = styled('div', {
  base: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3d4043', // fixme - copied from gmeet
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

type ParticipantPlaceholderProps = {
  participant: Participant
}

export const ParticipantPlaceholder = ({
  participant,
}: ParticipantPlaceholderProps) => {
  return (
    <StyledParticipantPlaceHolder>
      <Avatar name={participant.name} />
    </StyledParticipantPlaceHolder>
  )
}
