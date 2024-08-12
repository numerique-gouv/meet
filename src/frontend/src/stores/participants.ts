import { proxy } from 'valtio'

type State = {
  showParticipants: boolean
}

export const participantsStore = proxy<State>({
  showParticipants: false,
})
