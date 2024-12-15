import * as React from 'react'
import {
  LayoutContext,
  useMaybeTrackRefContext,
} from '@livekit/components-react'
import { RiFullscreenLine } from '@remixicon/react'
import { useFullscreenToggle } from '@/features/rooms/livekit/hooks/useFullscreenToggle'
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core'

export interface FullscreenToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackRef?: TrackReferenceOrPlaceholder
}

export const FullscreenToggle = React.forwardRef<
  HTMLButtonElement,
  FullscreenToggleProps
>(function FullscreenToggle(
  { trackRef, ...props }: FullscreenToggleProps,
  ref
) {
  const trackRefFromContext = useMaybeTrackRefContext()
  const { enterFullscreen, isFullscreenAvailable } = useFullscreenToggle(
    trackRef ?? trackRefFromContext
  )

  if (!isFullscreenAvailable) return null

  return (
    <LayoutContext.Consumer>
      {(layoutContext) =>
        layoutContext !== undefined && (
          <button
            ref={ref}
            className="lk-button lk-focus-toggle-button lk-fullscreen-toggle-button"
            onClick={enterFullscreen}
            {...props}
          >
            <RiFullscreenLine size={16} />
          </button>
        )
      }
    </LayoutContext.Consumer>
  )
})
