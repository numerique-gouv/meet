import { proxy } from 'valtio'

type State = {
  showHeader: boolean
}

export const layoutStore = proxy<State>({
  showHeader: false,
})
