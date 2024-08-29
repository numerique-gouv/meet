import { ApiRoom } from '@/features/rooms/api/ApiRoom'
import { useRoomContext } from '@livekit/components-react'
import { useParams } from 'wouter'
import { keys } from '@/api/queryKeys'
import { queryClient } from '@/api/queryClient'

export const useRoomData = (): ApiRoom | undefined => {
  const room = useRoomContext()
  const { roomId } = useParams()
  const queryKey = [keys.room, roomId, room.localParticipant.name]
  return queryClient.getQueryData<ApiRoom>(queryKey)
}
