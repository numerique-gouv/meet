import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { fetchApi } from '@/api/fetchApi'
import { ApiError } from '@/api/ApiError'
import { ApiRoom } from './ApiRoom'

export interface CreateRoomParams {
  slug: string
}

const createRoom = ({ slug }: CreateRoomParams): Promise<ApiRoom> => {
  return fetchApi(`rooms/`, {
    method: 'POST',
    body: JSON.stringify({
      name: slug,
    }),
  })
}

export function useCreateRoom(
  options?: UseMutationOptions<ApiRoom, ApiError, CreateRoomParams>
) {
  return useMutation<ApiRoom, ApiError, CreateRoomParams>({
    mutationFn: createRoom,
    onSuccess: options?.onSuccess,
  })
}
