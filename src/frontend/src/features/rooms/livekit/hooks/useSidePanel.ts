import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export enum PanelId {
  PARTICIPANTS = 'participants',
  EFFECTS = 'effects',
  CHAT = 'chat',
  ACTIVITIES = 'activities',
}

export const useSidePanel = () => {
  const layoutSnap = useSnapshot(layoutStore)
  const activePanelId = layoutSnap.activePanelId

  const isParticipantsOpen = activePanelId == PanelId.PARTICIPANTS
  const isEffectsOpen = activePanelId == PanelId.EFFECTS
  const isChatOpen = activePanelId == PanelId.CHAT
  const isActivitiesOpen = activePanelId == PanelId.ACTIVITIES
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

  const toggleActivities = () => {
    layoutStore.activePanelId = isActivitiesOpen ? null : PanelId.ACTIVITIES
  }

  return {
    activePanelId,
    toggleParticipants,
    toggleChat,
    toggleEffects,
    toggleActivities,
    isChatOpen,
    isParticipantsOpen,
    isEffectsOpen,
    isActivitiesOpen,
    isSidePanelOpen,
  }
}
