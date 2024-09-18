import { useLayoutContext } from '@livekit/components-react'
import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'

export const useWidgetInteraction = () => {
  const { dispatch, state } = useLayoutContext().widget

  const layoutSnap = useSnapshot(layoutStore)
  const sidePanel = layoutSnap.sidePanel

  const isParticipantsOpen = sidePanel == 'participants'

  const toggleParticipants = () => {
    if (dispatch && state?.showChat) {
      dispatch({ msg: 'toggle_chat' })
    }
    layoutStore.sidePanel = isParticipantsOpen ? null : 'participants'
  }

  const toggleChat = () => {
    if (isParticipantsOpen) {
      layoutStore.sidePanel = null
    }
    if (dispatch) {
      dispatch({ msg: 'toggle_chat' })
    }
  }

  return {
    toggleParticipants,
    toggleChat,
    isChatOpen: state?.showChat,
    unreadMessages: state?.unreadMessages,
    isParticipantsOpen,
  }
}
