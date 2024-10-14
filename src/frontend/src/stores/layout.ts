import { proxy } from 'valtio'
import { SidePanel } from '@/features/rooms/livekit/hooks/useSidePanel'

type State = {
  showHeader: boolean
  sidePanel: SidePanel | null
}

export const layoutStore = proxy<State>({
  showHeader: false,
  sidePanel: null,
})
