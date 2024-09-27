import { proxy } from 'valtio'

export type KeyboardShortcutHandler = () => void

type State = {
  shortcuts: Map<string, KeyboardShortcutHandler>
}

export const keyboardShortcutsStore = proxy<State>({
  shortcuts: new Map<string, KeyboardShortcutHandler>(),
})
