import { useCallback } from 'react'
import { TrackReferenceOrPlaceholder } from '@livekit/components-core'

export const useFullscreenToggle = (trackRef?: TrackReferenceOrPlaceholder) => {
  const getFullscreenElement = useCallback(() => {
    if (!trackRef?.publication?.track) return null
    const elements = trackRef.publication.track.attachedElements

    // Find the visible video element
    const likeKitElement = elements.find((el) =>
      el.classList.contains('lk-participant-media-video')
    )

    if (!likeKitElement) {
      console.warn('Could not find LiveKit-managed video element')
      return elements[0] || null
    }

    return likeKitElement
  }, [trackRef])

  const enterFullscreen = useCallback(async () => {
    const element = getFullscreenElement()
    if (!element) return

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
    } catch (e) {
      console.error('Error requesting fullscreen:', e)
    }
  }, [getFullscreenElement])

  return {
    enterFullscreen,
    isFullscreenAvailable: document.fullscreenEnabled,
  }
}
