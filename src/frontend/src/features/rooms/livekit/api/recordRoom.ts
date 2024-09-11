import { fetchServerApi } from './fetchServerApi'
import { buildServerApiUrl } from './buildServerApiUrl'
import { useRoomData } from '../hooks/useRoomData'
import { useParams } from 'wouter'

export const useRecordRoom = () => {
  const data = useRoomData()
  const { roomId: roomSlug } = useParams()

  const recordRoom = () => {
    if (!data || !data?.livekit) {
      throw new Error('Room data is not available')
    }
    if (!roomSlug) {
      throw new Error('Room ID is not available')
    }
    return fetchServerApi(
      buildServerApiUrl(
        data.livekit.url,
        '/twirp/livekit.Egress/StartRoomCompositeEgress'
      ),
      data.livekit.token,
      {
        method: 'POST',
        body: JSON.stringify({
          room_name: data.livekit.room,
          audio_only: true,
          file_outputs: [
            {
              file_extension: 'ogg',
              filepath: `{room_name}_{time}_${roomSlug}`,
            },
          ],
        }),
      }
    )
  }

  const stopRecordingRoom = (egressId: string) => {
    if (!data || !data?.livekit) {
      throw new Error('Room data is not available')
    }
    return fetchServerApi(
      buildServerApiUrl(data.livekit.url, '/twirp/livekit.Egress/StopEgress'),
      data.livekit.token,
      {
        method: 'POST',
        body: JSON.stringify({
          egressId,
        }),
      }
    )
  }

  return { recordRoom, stopRecordingRoom }
}
