import { Button } from '@/primitives'
import { useMediaDeviceSelect } from '@livekit/components-react'
import { RiCameraSwitchLine } from '@remixicon/react'
import { useState } from 'react'
import { ButtonProps } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

enum FacingMode {
  USER = 'user',
  ENVIRONMENT = 'environment',
}

export const CameraSwitchButton = (props: Partial<ButtonProps>) => {
  const { t } = useTranslation('rooms')

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({
      kind: 'videoinput',
      requestPermissions: true,
    })

  // getCapabilities type is not available.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getDeviceFacingMode = (device: any): string[] => {
    if (!device.getCapabilities) {
      return []
    }
    const capabilities = device.getCapabilities()
    if (!capabilities) {
      return []
    }
    if (typeof capabilities.facingMode !== 'object') {
      return []
    }
    return capabilities.facingMode
  }

  const detectCurrentFacingMode = (): FacingMode | null => {
    console.log('detectCurrentFacingMode')
    if (!activeDeviceId) {
      return null
    }
    const activeDevice = devices.find(
      (device) => device.deviceId === activeDeviceId
    )
    console.log('activeDevice', activeDevice, activeDeviceId)
    if (!activeDevice) {
      return null
    }
    const facingMode = getDeviceFacingMode(activeDevice)
    console.log('facingMode', facingMode)
    if (facingMode.indexOf(FacingMode.USER) >= 0) {
      return FacingMode.USER
    }
    if (facingMode.indexOf(FacingMode.ENVIRONMENT) >= 0) {
      return FacingMode.ENVIRONMENT
    }
    return null
  }

  const guessCurrentFacingMode = () => {
    const facingMode = detectCurrentFacingMode()
    if (facingMode) {
      return facingMode
    }
    // We consider by default if we have no clue that the user camera is used.
    return FacingMode.USER
  }

  const [facingMode, setFacingMode] = useState<FacingMode | null>(
    guessCurrentFacingMode()
  )

  const getUserDevice = (
    facingMode: FacingMode
  ): MediaDeviceInfo | undefined => {
    return devices.find((device) => {
      return getDeviceFacingMode(device).indexOf(facingMode) >= 0
    })
  }

  const toggle = () => {
    let target: FacingMode
    if (facingMode === FacingMode.USER) {
      target = FacingMode.ENVIRONMENT
    } else {
      target = FacingMode.USER
    }
    console.log('toggle', facingMode, 'target', target)
    const device = getUserDevice(target)
    console.log('device', device, device?.label, device?.kind)
    if (device) {
      setActiveMediaDevice(device.deviceId)
      setFacingMode(target)
    } else {
      console.error('Cannot get user device with facingMode ' + target)
    }
  }

  console.log('facingMode', facingMode)
  console.log('detectCurrentFacingMode', detectCurrentFacingMode())
  console.log('guessCurrentFacingMode', guessCurrentFacingMode())
  console.log('getUserDevice(target) user', getUserDevice(FacingMode.USER))
  console.log(
    'getUserDevice(target) ENVIRONMENT',
    getUserDevice(FacingMode.ENVIRONMENT)
  )

  return (
    <Button
      onPress={(e) => {
        toggle()
        props.onPress?.(e)
      }}
      variant="primaryTextDark"
      aria-label={t('options.items.switch_camera')}
      tooltip={t('options.items.switch_camera')}
      description={true}
    >
      <RiCameraSwitchLine size={20} />
    </Button>
  )
}
