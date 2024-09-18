import { proxy } from 'valtio'

type State = {
  showHeader: boolean
  sidePanel: 'participants' | 'effects' | null
}

export const layoutStore = proxy<State>({
  showHeader: false,
  sidePanel: null,
})
