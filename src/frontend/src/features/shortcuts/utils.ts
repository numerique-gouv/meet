import { isMacintosh } from '@/utils/livekit'

export const CTRL = 'ctrl'

export const formatShortcutKey = (key: string, ctrlKey?: boolean) => {
  if (ctrlKey) return `${CTRL}+${key.toUpperCase()}`
  return key.toUpperCase()
}

export const appendShortcutLabel = (
  label: string,
  key: string,
  ctrlKey?: boolean
) => {
  if (!key) return
  let formattedKeyLabel = key.toLowerCase()
  if (ctrlKey) {
    formattedKeyLabel = `${isMacintosh() ? '⌘' : 'Ctrl'}+${formattedKeyLabel}`
  }
  return `${label} (${formattedKeyLabel})`
}
