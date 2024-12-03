import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useIsAnalyticsEnabled } from '@/features/analytics/hooks/useIsAnalyticsEnabled'
import { useIsTranscriptEnabled } from './useIsTranscriptEnabled'
import { useIsAdminOrOwner } from './useIsAdminOrOwner'

export const useHasTranscriptAccess = () => {
  const featureEnabled = useFeatureFlagEnabled('transcription-summary')
  const isAnalyticsEnabled = useIsAnalyticsEnabled()
  const isTranscriptEnabled = useIsTranscriptEnabled()
  const isAdminOrOwner = useIsAdminOrOwner()

  return (
    (featureEnabled || !isAnalyticsEnabled) &&
    isAdminOrOwner &&
    isTranscriptEnabled
  )
}
