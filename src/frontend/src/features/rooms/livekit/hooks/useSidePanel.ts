import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export enum PanelId {
  PARTICIPANTS = 'participants',
  EFFECTS = 'effects',
  CHAT = 'chat',
  TRANSCRIPT = 'transcript',
}

export const useSidePanel = () => {
  const layoutSnap = useSnapshot(layoutStore)
  const activePanelId = layoutSnap.activePanelId

  const isParticipantsOpen = activePanelId == PanelId.PARTICIPANTS
  const isEffectsOpen = activePanelId == PanelId.EFFECTS
  const isChatOpen = activePanelId == PanelId.CHAT
  const isTranscriptOpen = activePanelId == PanelId.TRANSCRIPT
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

  const toggleTranscript = () => {
    layoutStore.activePanelId = isTranscriptOpen ? null : PanelId.TRANSCRIPT
  }

  return {
    activePanelId,
    toggleParticipants,
    toggleChat,
    toggleEffects,
    toggleTranscript,
    isChatOpen,
    isParticipantsOpen,
    isEffectsOpen,
    isSidePanelOpen,
    isTranscriptOpen,
  }
}
