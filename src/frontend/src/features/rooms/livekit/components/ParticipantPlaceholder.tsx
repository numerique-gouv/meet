import { Participant } from 'livekit-client'
import { styled } from '@/styled-system/jsx'
import { Avatar } from '@/components/Avatar'
import { useIsSpeaking } from '@livekit/components-react'
import { getParticipantColor } from '@/features/rooms/utils/getParticipantColor'

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
  const isSpeaking = useIsSpeaking(participant)
  const participantColor = getParticipantColor(participant)
  return (
    <StyledParticipantPlaceHolder>
      <div
        style={{
          borderRadius: '50%',
          animation: isSpeaking ? 'pulse 1s infinite' : undefined,
          width: '80%',
          maxWidth: '150px',
          height: 'auto',
          aspectRatio: '1/1',
          fontSize: '50px',
        }}
      >
        <Avatar
          name={participant.name}
          bgColor={participantColor}
          context="placeholder"
        />
      </div>
    </StyledParticipantPlaceHolder>
  )
}
