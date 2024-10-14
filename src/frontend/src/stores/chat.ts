import { proxy } from 'valtio'

type State = {
  unreadMessages: number
}

export const chatStore = proxy<State>({
  unreadMessages: 0,
})
