import { useLayoutContext } from '@livekit/components-react'
import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export enum SidePanel {
  PARTICIPANTS = 'participants',
  EFFECTS = 'effects',
}

export const useWidgetInteraction = () => {
  const { dispatch, state } = useLayoutContext().widget

  const layoutSnap = useSnapshot(layoutStore)
  const sidePanel = layoutSnap.sidePanel

  const isParticipantsOpen = sidePanel == SidePanel.PARTICIPANTS
  const isEffectsOpen = sidePanel == SidePanel.EFFECTS

  const toggleParticipants = () => {
    if (dispatch && state?.showChat) {
      dispatch({ msg: 'toggle_chat' })
    }
    layoutStore.sidePanel = isParticipantsOpen ? null : SidePanel.PARTICIPANTS
  }

  const toggleChat = () => {
    if (isParticipantsOpen || isEffectsOpen) {
      layoutStore.sidePanel = null
    }
    if (dispatch) {
      dispatch({ msg: 'toggle_chat' })
    }
  }

  const toggleEffects = () => {
    if (dispatch && state?.showChat) {
      dispatch({ msg: 'toggle_chat' })
    }
    layoutStore.sidePanel = isEffectsOpen ? null : SidePanel.EFFECTS
  }

  return {
    toggleParticipants,
    toggleChat,
    toggleEffects,
    isChatOpen: state?.showChat,
    unreadMessages: state?.unreadMessages,
    isParticipantsOpen,
    isEffectsOpen,
  }
}
