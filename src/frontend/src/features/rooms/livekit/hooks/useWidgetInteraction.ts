import { useLayoutContext } from '@livekit/components-react'
import { useSnapshot } from 'valtio'
import { participantsStore } from '@/stores/participants.ts'

export const useWidgetInteraction = () => {
  const { dispatch, state } = useLayoutContext().widget

  const participantsSnap = useSnapshot(participantsStore)
  const isParticipantsOpen = participantsSnap.showParticipants

  const toggleParticipants = () => {
    if (dispatch && state?.showChat) {
      dispatch({ msg: 'toggle_chat' })
    }
    participantsStore.showParticipants = !isParticipantsOpen
  }

  const toggleChat = () => {
    if (isParticipantsOpen) {
      participantsStore.showParticipants = false
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
