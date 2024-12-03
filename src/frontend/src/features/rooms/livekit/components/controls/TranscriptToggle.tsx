import { ToggleButton } from '@/primitives'
import { RiBardLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useSidePanel } from '@/features/rooms/livekit/hooks/useSidePanel'
import { css } from '@/styled-system/css'
import { useFeatureFlagEnabled } from 'posthog-js/react'
import { useIsAnalyticsEnabled } from '@/features/analytics/hooks/useIsAnalyticsEnabled'
import { useIsTranscriptEnabled } from '@/features/rooms/livekit/hooks/useIsTranscriptEnabled'

export const TranscriptToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.transcript' })

  const { isTranscriptOpen, toggleTranscript } = useSidePanel()
  const tooltipLabel = isTranscriptOpen ? 'open' : 'closed'

  const featureEnabled = useFeatureFlagEnabled('transcription-summary')
  const isAnalyticsEnabled = useIsAnalyticsEnabled()
  const isTranscriptEnabled = useIsTranscriptEnabled()

  if (!featureEnabled && isAnalyticsEnabled) return
  if (!isTranscriptEnabled) return

  return (
    <div
      className={css({
        position: 'relative',
        display: 'inline-block',
      })}
    >
      <ToggleButton
        square
        variant="primaryTextDark"
        aria-label={t(tooltipLabel)}
        tooltip={t(tooltipLabel)}
        isSelected={isTranscriptOpen}
        onPress={() => toggleTranscript()}
      >
        <RiBardLine />
      </ToggleButton>
    </div>
  )
}
