import { isMacintosh } from '@/utils/livekit'
import { Shortcut } from '@/features/shortcuts/types'

export const CTRL = 'ctrl'

export const formatShortcutKey = (shortcut: Shortcut) => {
  if (shortcut.ctrlKey) return `${CTRL}+${shortcut.key.toUpperCase()}`
  return shortcut.key.toUpperCase()
}

export const appendShortcutLabel = (label: string, shortcut: Shortcut) => {
  if (!shortcut.key) return
  let formattedKeyLabel = shortcut.key.toLowerCase()
  if (shortcut.ctrlKey) {
    formattedKeyLabel = `${isMacintosh() ? '⌘' : 'Ctrl'}+${formattedKeyLabel}`
  }
  return `${label} (${formattedKeyLabel})`
}
