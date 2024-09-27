import { useEffect } from 'react'
import { keyboardShortcutsStore } from '@/stores/keyboardShortcuts'
import { formatShortcutKey } from '@/features/shortcuts/utils'
import { Shortcut } from '@/features/shortcuts/types'

export type useRegisterKeyboardShortcutProps = {
  shortcut?: Shortcut
  handler: () => void
}

export const useRegisterKeyboardShortcut = ({
  shortcut,
  handler,
}: useRegisterKeyboardShortcutProps) => {
  useEffect(() => {
    if (!shortcut) return
    keyboardShortcutsStore.shortcuts.set(formatShortcutKey(shortcut), handler)
  }, [handler, shortcut])
}
