import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { fetchApi } from '@/api/fetchApi'
import { ApiError } from '@/api/ApiError'
import { ApiRoom } from './ApiRoom'

export interface StopRecordingParams {
  slug: string
}

const stopRecording = ({ slug }: StopRecordingParams): Promise<ApiRoom> => {
  return fetchApi(`rooms/${slug}/stop-recording/`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function useStopRecording(
  options?: UseMutationOptions<ApiRoom, ApiError, StopRecordingParams>
) {
  return useMutation<ApiRoom, ApiError, StopRecordingParams>({
    mutationFn: stopRecording,
    onSuccess: options?.onSuccess,
  })
}
