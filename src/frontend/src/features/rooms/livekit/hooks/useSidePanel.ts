import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export enum SidePanel {
  PARTICIPANTS = 'participants',
  EFFECTS = 'effects',
  CHAT = 'chat',
}

export const useSidePanel = () => {
  const layoutSnap = useSnapshot(layoutStore)
  const sidePanel = layoutSnap.sidePanel

  const isParticipantsOpen = sidePanel == SidePanel.PARTICIPANTS
  const isEffectsOpen = sidePanel == SidePanel.EFFECTS
  const isChatOpen = sidePanel == SidePanel.CHAT

  const toggleParticipants = () => {
    layoutStore.sidePanel = isParticipantsOpen ? null : SidePanel.PARTICIPANTS
  }

  const toggleChat = () => {
    layoutStore.sidePanel = isChatOpen ? null : SidePanel.CHAT
  }

  const toggleEffects = () => {
    layoutStore.sidePanel = isEffectsOpen ? null : SidePanel.EFFECTS
  }

  return {
    toggleParticipants,
    toggleChat,
    toggleEffects,
    isChatOpen,
    isParticipantsOpen,
    isEffectsOpen,
  }
}
