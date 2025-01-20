import { ToggleButton } from '@/primitives'
import { useRegisterKeyboardShortcut } from '@/features/shortcuts/useRegisterKeyboardShortcut'
import { useMemo, useState } from 'react'
import { appendShortcutLabel } from '@/features/shortcuts/utils'
import { useTranslation } from 'react-i18next'
import { SelectToggleDeviceConfig } from './SelectToggleDevice'
import useLongPress from '@/features/shortcuts/useLongPress'
import { ActiveSpeaker } from '@/features/rooms/components/ActiveSpeaker'
import {
  useIsSpeaking,
  useLocalParticipant,
  useMaybeRoomContext,
} from '@livekit/components-react'
import { ButtonRecipeProps } from '@/primitives/buttonRecipe'

export type ToggleDeviceProps = {
  enabled: boolean
  toggle: () => void
  config: SelectToggleDeviceConfig
  variant?: NonNullable<ButtonRecipeProps>['variant']
}

export const ToggleDevice = ({
  config,
  enabled,
  toggle,
  variant = 'primaryDark',
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

  const context = useMaybeRoomContext()
  if (kind === 'audioinput' && pushToTalk && context) {
    return <ActiveSpeakerWrapper />
  }

  return (
    <ToggleButton
      isSelected={!enabled}
      variant={enabled ? variant : 'error2'}
      shySelected
      onPress={() => toggle()}
      aria-label={toggleLabel}
      tooltip={toggleLabel}
      groupPosition="left"
    >
      <Icon />
    </ToggleButton>
  )
}

const ActiveSpeakerWrapper = () => {
  const { localParticipant } = useLocalParticipant()
  const isSpeaking = useIsSpeaking(localParticipant)
  return <ActiveSpeaker isSpeaking={isSpeaking} pushToTalk />
}
