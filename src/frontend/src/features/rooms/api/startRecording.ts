import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { fetchApi } from '@/api/fetchApi'
import { ApiError } from '@/api/ApiError'
import { ApiRoom } from './ApiRoom'

export interface StartRecordingParams {
  slug: string
}

const startRecording = ({ slug }: StartRecordingParams): Promise<ApiRoom> => {
  return fetchApi(`rooms/${slug}/start-recording/`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function useStartRecording(
  options?: UseMutationOptions<ApiRoom, ApiError, StartRecordingParams>
) {
  return useMutation<ApiRoom, ApiError, StartRecordingParams>({
    mutationFn: startRecording,
    onSuccess: options?.onSuccess,
  })
}
