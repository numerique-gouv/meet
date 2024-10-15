import { proxy } from 'valtio'

type State = {
  egressId: string | undefined
  egressIsStopping: boolean
}

export const egressStore = proxy<State>({
  egressId: undefined,
  egressIsStopping: false,
})
