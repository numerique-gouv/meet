import { useRoomData } from './useRoomData'

export const useIsAdminOrOwner = () => {
  const apiRoomData = useRoomData()
  return apiRoomData?.is_administrable
}
