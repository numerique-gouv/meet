import { ApiError } from '@/api/ApiError'
import { type ApiRoom } from './ApiRoom'
import { fetchApi } from '@/api/fetchApi'

export const fetchRoom = ({
  roomId,
  username = '',
}: {
  roomId: string
  username?: string
}) => {
  return fetchApi<ApiRoom>(
    `/rooms/${roomId}?username=${encodeURIComponent(username)}`
  ).then((room) => {
    if (!room.livekit?.token || !room.livekit?.url) {
      throw new ApiError(500, 'LiveKit info not found')
    }
    return room
  })
}
