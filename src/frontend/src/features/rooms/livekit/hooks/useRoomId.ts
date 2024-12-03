import { useRoomData } from './useRoomData'

export const useRoomId = () => {
  const apiRoomData = useRoomData()
  return apiRoomData?.livekit?.room
}
