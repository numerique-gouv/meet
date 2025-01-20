import { useTranslation } from 'react-i18next'
import {
  useMediaDeviceSelect,
  useTrackToggle,
  UseTrackToggleProps,
} from '@livekit/components-react'
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
import { css } from '@/styled-system/css'
import { ButtonRecipeProps } from '@/primitives/buttonRecipe'

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
    variant?: NonNullable<ButtonRecipeProps>['variant']
  }

export const SelectToggleDevice = <T extends ToggleSource>({
  onActiveDeviceChange,
  variant = 'primaryDark',
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
    <div
      className={css({
        display: 'flex',
        gap: '1px',
      })}
    >
      <ToggleDevice {...trackProps} config={config} variant={variant} />
      <Menu>
        <Button
          tooltip={selectLabel}
          aria-label={selectLabel}
          groupPosition="right"
          square
          variant={trackProps.enabled ? variant : 'error2'}
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
    </div>
  )
}
