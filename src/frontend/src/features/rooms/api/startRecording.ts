import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { fetchApi } from '@/api/fetchApi'
import { ApiError } from '@/api/ApiError'
import { ApiRoom } from './ApiRoom'

export enum RecordingMode {
  Transcript = 'transcript',
  ScreenRecording = 'screen_recording',
}

export interface StartRecordingParams {
  id: string
  mode?: RecordingMode
}

const startRecording = ({
  id,
  mode = RecordingMode.Transcript,
}: StartRecordingParams): Promise<ApiRoom> => {
  return fetchApi(`rooms/${id}/start-recording/`, {
    method: 'POST',
    body: JSON.stringify({
      mode: mode,
    }),
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
