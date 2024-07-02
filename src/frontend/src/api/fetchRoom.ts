import { ApiRoom } from './ApiRoom'
import { fetchApi } from './fetchApi'

export const fetchRoom = (roomId: string) => {
  return fetchApi<ApiRoom>(`/rooms/${roomId}`)
}
