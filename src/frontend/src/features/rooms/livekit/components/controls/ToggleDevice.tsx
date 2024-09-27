import { ToggleButton } from '@/primitives'
import { useRegisterKeyboardShortcut } from '@/features/shortcuts/useRegisterKeyboardShortcut'
import { useMemo } from 'react'
import { appendShortcutLabel } from '@/features/shortcuts/utils'
import { useTranslation } from 'react-i18next'
import { SelectToggleDeviceConfig } from './SelectToggleDevice'

export type ToggleDeviceProps = {
  enabled: boolean
  toggle: () => void
  config: SelectToggleDeviceConfig
}

export const ToggleDevice = ({
  config,
  enabled,
  toggle,
}: ToggleDeviceProps) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'join' })

  const { kind, shortcut, iconOn, iconOff } = config

  useRegisterKeyboardShortcut({ shortcut, handler: toggle })

  const toggleLabel = useMemo(() => {
    const label = t(enabled ? 'disable' : 'enable', {
      keyPrefix: `join.${kind}`,
    })
    return shortcut ? appendShortcutLabel(label, shortcut) : label
  }, [enabled, kind, shortcut, t])

  const Icon = enabled ? iconOn : iconOff

  return (
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
  )
}
