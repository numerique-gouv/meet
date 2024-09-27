import { useTranslation } from 'react-i18next'
import {
  useMediaDeviceSelect,
  useTrackToggle,
  UseTrackToggleProps,
} from '@livekit/components-react'
import { HStack } from '@/styled-system/jsx'
import { Button, Menu, MenuList, ToggleButton } from '@/primitives'
import {
  RemixiconComponentType,
  RiArrowDownSLine,
  RiMicLine,
  RiMicOffLine,
  RiVideoOffLine,
  RiVideoOnLine,
} from '@remixicon/react'
import { Track } from 'livekit-client'

import { useEffect, useMemo } from 'react'

import { keyboardShortcutsStore } from '@/stores/keyboardShortcuts'
import {
  formatShortcutKey,
  appendShortcutLabel,
} from '@/features/shortcuts/utils'

export type ToggleSource = Exclude<
  Track.Source,
  Track.Source.ScreenShareAudio | Track.Source.Unknown
>

type SelectToggleSource = Exclude<ToggleSource, Track.Source.ScreenShare>

type SelectToggleDeviceConfig = {
  kind: MediaDeviceKind
  iconOn: RemixiconComponentType
  iconOff: RemixiconComponentType
  shortcutKey?: string
}

type SelectToggleDeviceConfigMap = {
  [key in SelectToggleSource]: SelectToggleDeviceConfig
}

const selectToggleDeviceConfig: SelectToggleDeviceConfigMap = {
  [Track.Source.Microphone]: {
    kind: 'audioinput',
    iconOn: RiMicLine,
    iconOff: RiMicOffLine,
    shortcutKey: 'd',
  },
  [Track.Source.Camera]: {
    kind: 'videoinput',
    iconOn: RiVideoOnLine,
    iconOff: RiVideoOffLine,
    shortcutKey: 'e',
  },
}

type SelectToggleDeviceProps<T extends ToggleSource> =
  UseTrackToggleProps<T> & {
    onActiveDeviceChange: (deviceId: string) => void
    shortcutKey?: string
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
  const { toggle, enabled } = useTrackToggle(props)

  const { kind, iconOn, iconOff } = config

  const { devices, activeDeviceId, setActiveMediaDevice } =
    useMediaDeviceSelect({ kind })

  const toggleLabel = useMemo(() => {
    const label = t(enabled ? 'disable' : 'enable', {
      keyPrefix: `join.${kind}`,
    })
    return config.shortcutKey
      ? appendShortcutLabel(label, config.shortcutKey, true)
      : label
  }, [enabled, kind, config.shortcutKey, t])

  const selectLabel = t('choose', { keyPrefix: `join.${kind}` })
  const Icon = enabled ? iconOn : iconOff

  useEffect(() => {
    if (!config.shortcutKey) return
    keyboardShortcutsStore.shortcuts.set(
      formatShortcutKey(config.shortcutKey, true),
      () => toggle()
    )
  }, [toggle, config.shortcutKey])

  return (
    <HStack gap={0}>
      <ToggleButton
        isSelected={enabled}
        variant={enabled ? undefined : 'danger'}
        toggledStyles={false}
        onPress={() => toggle()}
        aria-label={toggleLabel}
        tooltip={toggleLabel}
        groupPosition="left"
      >
        <Icon />
      </ToggleButton>
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
