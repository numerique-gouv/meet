import { Participant, Track } from 'livekit-client'
import Source = Track.Source
import { fetchServerApi } from './fetchServerApi'
import { buildServerApiUrl } from './buildServerApiUrl'
import { useRoomData } from '../hooks/useRoomData'

export const useMuteParticipant = () => {
  const data = useRoomData()

  const muteParticipant = (participant: Participant) => {
    if (!data || !data?.livekit) {
      throw new Error('Room data is not available')
    }
    const trackSid = participant.getTrackPublication(
      Source.Microphone
    )?.trackSid

    if (!trackSid) {
      throw new Error('Missing audio track')
    }
    return fetchServerApi(
      buildServerApiUrl(
        data.livekit.url,
        'twirp/livekit.RoomService/MutePublishedTrack'
      ),
      data.livekit.token,
      {
        method: 'POST',
        body: JSON.stringify({
          room: data.livekit.room,
          identity: participant.identity,
          muted: true,
          track_sid: trackSid,
        }),
      }
    )
  }
  return { muteParticipant }
}
