import { proxy } from 'valtio'

type State = {
  egressId: string | undefined
}

export const egressStore = proxy<State>({
  egressId: undefined,
})
