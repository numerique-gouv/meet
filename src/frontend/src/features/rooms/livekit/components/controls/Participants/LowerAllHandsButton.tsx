import { Button } from '@/primitives'
import { useLowerHandParticipants } from '@/features/rooms/livekit/api/lowerHandParticipants'
import { useTranslation } from 'react-i18next'
import { Participant } from 'livekit-client'

type LowerAllHandsButtonProps = {
  participants: Array<Participant>
}

export const LowerAllHandsButton = ({
  participants,
}: LowerAllHandsButtonProps) => {
  const { lowerHandParticipants } = useLowerHandParticipants()
  const { t } = useTranslation('rooms')
  return (
    <Button
      aria-label={t('participants.lowerParticipantsHand')}
      size="sm"
      fullWidth
      variant="text"
      onPress={() => lowerHandParticipants(participants)}
      data-attr="participants-lower-hands"
    >
      {t('participants.lowerParticipantsHand')}
    </Button>
  )
}
