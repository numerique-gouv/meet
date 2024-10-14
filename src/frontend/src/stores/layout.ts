import { proxy } from 'valtio'
import { PanelId } from '@/features/rooms/livekit/hooks/useSidePanel'

type State = {
  showHeader: boolean
  activePanelId: PanelId | null
}

export const layoutStore = proxy<State>({
  showHeader: false,
  activePanelId: null,
})
