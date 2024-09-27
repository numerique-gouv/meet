import { useTranslation } from 'react-i18next'
import {
  useMediaDeviceSelect,
  useTrackToggle,
  UseTrackToggleProps,
} from '@livekit/components-react'
import { HStack } from '@/styled-system/jsx'
import { Button, Menu, MenuList } from '@/primitives'
import {
  RemixiconComponentType,
  RiArrowDownSLine,
  RiMicLine,
  RiMicOffLine,
  RiVideoOffLine,
  RiVideoOnLine,
} from '@remixicon/react'
import { Track } from 'livekit-client'

import { Shortcut } from '@/features/shortcuts/types'

import { ToggleDevice } from '@/features/rooms/livekit/components/controls/ToggleDevice.tsx'

export type ToggleSource = Exclude<
  Track.Source,
  Track.Source.ScreenShareAudio | Track.Source.Unknown
>

type SelectToggleSource = Exclude<ToggleSource, Track.Source.ScreenShare>

export type SelectToggleDeviceConfig = {
  kind: MediaDeviceKind
  iconOn: RemixiconComponentType
  iconOff: RemixiconComponentType
  shortcut?: Shortcut
  longPress?: Shortcut
}

type SelectToggleDeviceConfigMap = {
  [key in SelectToggleSource]: SelectToggleDeviceConfig
}

const selectToggleDeviceConfig: SelectToggleDeviceConfigMap = {
  [Track.Source.Microphone]: {
    kind: 'audioinput',
    iconOn: RiMicLine,
    iconOff: RiMicOffLine,
    shortcut: {
      key: 'd',
      ctrlKey: true,
    },
    longPress: {
      key: 'Space',
    },
  },
  [Track.Source.Camera]: {
    kind: 'videoinput',
    iconOn: RiVideoOnLine,
    iconOff: RiVideoOffLine,
    shortcut: {
      key: 'e',
      ctrlKey: true,
    },
  },
}

type SelectToggleDeviceProps<T extends ToggleSource> =
  UseTrackToggleProps<T> & {
    onActiveDeviceChange: (deviceId: string) => void
    source: SelectToggleSource
  }

export const SelectToggleDevice = <T extends ToggleSource>({
  onActiveDeviceChange,
  ...props
}: SelectToggleDeviceProps<T>) => {
  const config = selectToggleDeviceConfig[props.source]
  if (!config) {
    throw new Error('Invalid source')
  }
  const { t } = useTranslation('rooms', { keyPrefix: 'join' })
  const trackProps = useTrackToggle(props)

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind: config.kind })

  const selectLabel = t('choose', { keyPrefix: `join.${config.kind}` })

  return (
    <HStack gap={0}>
      <ToggleDevice {...trackProps} config={config} />
      <Menu>
        <Button
          tooltip={selectLabel}
          aria-label={selectLabel}
          groupPosition="right"
          square
        >
          <RiArrowDownSLine />
        </Button>
        <MenuList
          items={devices.map((d) => ({
            value: d.deviceId,
            label: d.label,
          }))}
          selectedItem={activeDeviceId}
          onAction={(value) => {
            setActiveMediaDevice(value as string)
            onActiveDeviceChange(value as string)
          }}
        />
      </Menu>
    </HStack>
  )
}
