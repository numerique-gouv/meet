import { DialogProps, Field, H } from '@/primitives'

import { TabPanel, TabPanelProps } from '@/primitives/Tabs'
import { useMediaDeviceSelect } from '@livekit/components-react'
import { isSafari } from '@/utils/livekit'
import { useTranslation } from 'react-i18next'

export type AudioTabProps = Pick<DialogProps, 'onOpenChange'> &
  Pick<TabPanelProps, 'id'>

type DeviceItems = Array<{ value: string; label: string }>

export const AudioTab = ({ id }: AudioTabProps) => {
  const { t } = useTranslation('settings')

  const {
    devices: devicesOut,
    activeDeviceId: activeDeviceIdOut,
    setActiveMediaDevice: setActiveMediaDeviceOut,
  } = useMediaDeviceSelect({ kind: 'audiooutput' })

  const {
    devices: devicesIn,
    activeDeviceId: activeDeviceIdIn,
    setActiveMediaDevice: setActiveMediaDeviceIn,
  } = useMediaDeviceSelect({ kind: 'audioinput' })

  const itemsOut: DeviceItems = devicesOut.map((d) => ({
    value: d.deviceId,
    label: d.label,
  }))

  const itemsIn: DeviceItems = devicesIn.map((d) => ({
    value: d.deviceId,
    label: d.label,
  }))

  // The Permissions API is not fully supported in Firefox and Safari, and attempting to use it for microphone permissions
  // may raise an error. As a workaround, we infer microphone permission status by checking if the list of audio input
  // devices (devicesIn) is non-empty. If the list has one or more devices, we assume the user has granted microphone access.
  const isMicEnabled = devicesIn?.length > 0

  const disabledProps = isMicEnabled
    ? {}
    : {
        placeholder: t('audio.permissionsRequired'),
        isDisabled: true,
        defaultSelectedKey: undefined,
      }

  // No API to directly query the default audio device; this function heuristically finds it.
  // Returns the item with value 'default' if present; otherwise, returns the first item in the list.
  const getDefaultSelectedKey = (items: DeviceItems) => {
    if (!items || items.length === 0) return
    const defaultItem =
      items.find((item) => item.value === 'default') || items[0]
    return defaultItem.value
  }

  return (
    <TabPanel padding={'md'} flex id={id}>
      <H lvl={2}>{t('audio.microphone.heading')}</H>
      <Field
        type="select"
        label={t('audio.microphone.label')}
        items={itemsIn}
        defaultSelectedKey={activeDeviceIdIn || getDefaultSelectedKey(itemsIn)}
        onSelectionChange={(key) => setActiveMediaDeviceIn(key as string)}
        {...disabledProps}
      />
      {/* Safari has a known limitation where its implementation of 'enumerateDevices' does not include audio output devices.
        To prevent errors or an empty selection list, we only render the speakers selection field on non-Safari browsers. */}
      {!isSafari() && (
        <>
          <H lvl={2}>{t('audio.speakers.heading')}</H>
          <Field
            type="select"
            label={t('audio.speakers.label')}
            items={itemsOut}
            defaultSelectedKey={
              activeDeviceIdOut || getDefaultSelectedKey(itemsOut)
            }
            onSelectionChange={(key) => setActiveMediaDeviceOut(key as string)}
            {...disabledProps}
          />
        </>
      )}
    </TabPanel>
  )
}
