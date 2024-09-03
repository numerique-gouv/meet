import { Participant } from 'livekit-client'
import { useLowerHandParticipant } from '@/features/rooms/livekit/api/lowerHandParticipant'

export const useLowerHandParticipants = () => {
  const { lowerHandParticipant } = useLowerHandParticipant()

  const lowerHandParticipants = (participants: Array<Participant>) => {
    try {
      const promises = participants.map((participant) =>
        lowerHandParticipant(participant)
      )
      return Promise.all(promises)
    } catch (error) {
      throw new Error('An error occurred while lowering hands.')
    }
  }
  return { lowerHandParticipants }
}
