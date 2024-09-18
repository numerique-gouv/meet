import { proxy } from 'valtio'

type State = {
  showHeader: boolean
  sidePanel: 'participants' | null
}

export const layoutStore = proxy<State>({
  showHeader: false,
  sidePanel: null,
})
