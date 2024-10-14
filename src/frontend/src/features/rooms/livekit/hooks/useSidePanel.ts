import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export enum PanelId {
  PARTICIPANTS = 'participants',
  EFFECTS = 'effects',
  CHAT = 'chat',
}

export const useSidePanel = () => {
  const layoutSnap = useSnapshot(layoutStore)
  const activePanelId = layoutSnap.activePanelId

  const isParticipantsOpen = activePanelId == PanelId.PARTICIPANTS
  const isEffectsOpen = activePanelId == PanelId.EFFECTS
  const isChatOpen = activePanelId == PanelId.CHAT
  const isSidePanelOpen = !!activePanelId

  const toggleParticipants = () => {
    layoutStore.activePanelId = isParticipantsOpen ? null : PanelId.PARTICIPANTS
  }

  const toggleChat = () => {
    layoutStore.activePanelId = isChatOpen ? null : PanelId.CHAT
  }

  const toggleEffects = () => {
    layoutStore.activePanelId = isEffectsOpen ? null : PanelId.EFFECTS
  }

  return {
    activePanelId,
    toggleParticipants,
    toggleChat,
    toggleEffects,
    isChatOpen,
    isParticipantsOpen,
    isEffectsOpen,
    isSidePanelOpen,
  }
}
