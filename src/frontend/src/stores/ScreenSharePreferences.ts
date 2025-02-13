import { proxy } from 'valtio'

type State = {
  enabled: boolean
}

export const ScreenSharePreferenceStore = proxy<State>({
  enabled: true,
})
