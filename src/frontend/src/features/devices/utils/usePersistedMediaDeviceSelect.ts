import { useMediaDeviceSelect } from '@livekit/components-react'
import { settingsStore } from '@/features/settings'

/**
 * wrap livekit's useMediaDeviceSelect to automatically save in our devices state user selection
 *
 * note: audiooutput devices are not handled here as we dont use useMediaDeviceSelect for them
 */
export const usePersistedMediaDeviceSelect = (
  ...args: Parameters<typeof useMediaDeviceSelect>
): ReturnType<typeof useMediaDeviceSelect> => {
  const results = useMediaDeviceSelect(...args)
  const originalSetter = results.setActiveMediaDevice
  results.setActiveMediaDevice = (
    ...activeMediaDeviceArgs: Parameters<typeof results.setActiveMediaDevice>
  ) => {
    const id = activeMediaDeviceArgs[0]
    if (args[0].kind === 'audioinput') {
      settingsStore.devices.micDeviceId = id
    }
    if (args[0].kind === 'videoinput') {
      settingsStore.devices.cameraDeviceId = id
    }
    return originalSetter(...activeMediaDeviceArgs)
  }
  return results
}
