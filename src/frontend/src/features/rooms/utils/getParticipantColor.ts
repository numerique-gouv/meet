import { Participant } from 'livekit-client'

export const getParticipantColor = (
  participant: Participant
): undefined | string => {
  const { metadata } = participant
  if (!metadata) {
    return
  }
  return JSON.parse(metadata)['color']
}
