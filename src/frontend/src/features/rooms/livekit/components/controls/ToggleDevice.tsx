import { ToggleButton } from '@/primitives'
import { useRegisterKeyboardShortcut } from '@/features/shortcuts/useRegisterKeyboardShortcut'
import { useMemo, useState } from 'react'
import { appendShortcutLabel } from '@/features/shortcuts/utils'
import { useTranslation } from 'react-i18next'
import { SelectToggleDeviceConfig } from './SelectToggleDevice'
import useLongPress from '@/features/shortcuts/useLongPress'
import { ActiveSpeaker } from '@/features/rooms/components/ActiveSpeaker'
import { useIsSpeaking, useLocalParticipant } from '@livekit/components-react'
import { ToggleButtonProps } from '@/primitives/ToggleButton'

export type ToggleDeviceProps = {
  enabled: boolean
  toggle: () => void
  config: SelectToggleDeviceConfig
  toggleButtonProps?: Partial<ToggleButtonProps>
}

export const ToggleDevice = ({
  config,
  enabled,
  toggle,
  toggleButtonProps,
}: ToggleDeviceProps) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'join' })

  const { kind, shortcut, iconOn, iconOff, longPress } = config

  const [pushToTalk, setPushToTalk] = useState(false)

  const onKeyDown = () => {
    if (pushToTalk || enabled) return
    toggle()
    setPushToTalk(true)
  }
  const onKeyUp = () => {
    if (!pushToTalk) return
    toggle()
    setPushToTalk(false)
  }

  useRegisterKeyboardShortcut({ shortcut, handler: toggle })
  useLongPress({ keyCode: longPress?.key, onKeyDown, onKeyUp })

  const toggleLabel = useMemo(() => {
    const label = t(enabled ? 'disable' : 'enable', {
      keyPrefix: `join.${kind}`,
    })
    return shortcut ? appendShortcutLabel(label, shortcut) : label
  }, [enabled, kind, shortcut, t])

  const Icon = enabled ? iconOn : iconOff

  const { localParticipant } = useLocalParticipant()
  const isSpeaking = useIsSpeaking(localParticipant)

  if (kind === 'audioinput' && pushToTalk) {
    return <ActiveSpeaker isSpeaking={isSpeaking} pushToTalk />
  }

  return (
    <ToggleButton
      isSelected={!enabled}
      variant={enabled ? 'primaryDark' : 'error2'}
      shySelected
      onPress={() => toggle()}
      aria-label={toggleLabel}
      tooltip={toggleLabel}
      groupPosition="left"
      {...toggleButtonProps}
    >
      <Icon />
    </ToggleButton>
  )
}
