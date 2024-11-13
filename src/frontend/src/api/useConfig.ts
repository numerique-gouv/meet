import { fetchApi } from './fetchApi'
import { keys } from './queryKeys'
import { useQuery } from '@tanstack/react-query'

// todo - refactor it in a proper place
export enum RecordingMode {
  Transcript = 'transcript',
  ScreenRecording = 'screen_recording',
}

export interface ApiConfig {
  analytics?: {
    id: string
    host: string
  }
  support?: {
    id: string
  }
  silence_livekit_debug_logs?: boolean
  recording?: {
    is_enabled?: boolean
    available_modes?: RecordingMode[]
  }
}

const fetchConfig = (): Promise<ApiConfig> => {
  return fetchApi<ApiConfig>(`config/`)
}

export const useConfig = () => {
  return useQuery({
    queryKey: [keys.config],
    queryFn: fetchConfig,
    staleTime: Infinity,
  })
}
