import { proxy } from 'valtio'
import { PanelId } from '@/features/rooms/livekit/hooks/useSidePanel'

type State = {
  showHeader: boolean
  showFooter: boolean
  activePanelId: PanelId | null
}

export const layoutStore = proxy<State>({
  showHeader: false,
  showFooter: false,
  activePanelId: null,
})
