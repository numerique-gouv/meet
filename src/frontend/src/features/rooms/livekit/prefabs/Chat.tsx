import type { ChatMessage, ChatOptions } from '@livekit/components-core'
import * as React from 'react'
import {
  formatChatMessageLinks,
  useChat,
  useParticipants,
} from '@livekit/components-react'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { chatStore } from '@/stores/chat'
import { Div, Text } from '@/primitives'
import { ChatInput } from '../components/chat/Input'
import { ChatEntry } from '../components/chat/Entry'
import { useSidePanel } from '../hooks/useSidePanel'

export interface ChatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChatOptions {}

/**
 * The Chat component adds a basis chat functionality to the LiveKit room. The messages are distributed to all participants
 * in the room. Only users who are in the room at the time of dispatch will receive the message.
 */
export function Chat({ ...props }: ChatProps) {
  const { t } = useTranslation('rooms', { keyPrefix: 'chat' })

  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const ulRef = React.useRef<HTMLUListElement>(null)

  const { send, chatMessages, isSending } = useChat()

  const { isChatOpen } = useSidePanel()
  const chatSnap = useSnapshot(chatStore)

  // Use useParticipants hook to trigger a re-render when the participant list changes.
  const participants = useParticipants()

  const lastReadMsgAt = React.useRef<ChatMessage['timestamp']>(0)

  async function handleSubmit(text: string) {
    if (!send || !text) return
    await send(text)
    inputRef?.current?.focus()
  }

  React.useEffect(() => {
    if (chatMessages.length > 0 && ulRef.current) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight })
    }
  }, [ulRef, chatMessages])

  React.useEffect(() => {
    if (chatMessages.length === 0) {
      return
    }
    if (
      isChatOpen &&
      lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
    ) {
      lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp
      chatStore.unreadMessages = 0
      return
    }

    const unreadMessageCount = chatMessages.filter(
      (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current
    ).length

    if (
      unreadMessageCount > 0 &&
      chatSnap.unreadMessages !== unreadMessageCount
    ) {
      chatStore.unreadMessages = unreadMessageCount
    }
  }, [chatMessages, chatSnap.unreadMessages, isChatOpen])

  const renderedMessages = React.useMemo(() => {
    return chatMessages.map((msg, idx, allMsg) => {
      const hideMetadata =
        idx >= 1 &&
        msg.timestamp - allMsg[idx - 1].timestamp < 60_000 &&
        allMsg[idx - 1].from === msg.from

      return (
        <ChatEntry
          key={msg.id ?? idx}
          hideMetadata={hideMetadata}
          entry={msg}
          messageFormatter={formatChatMessageLinks}
        />
      )
    })
    // This ensures that the chat message list is updated to reflect any changes in participant information.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages, participants])

  return (
    <Div
      display={'flex'}
      padding={'0 1.5rem'}
      flexGrow={1}
      flexDirection={'column'}
      minHeight={0}
      {...props}
    >
      <Text
        variant="sm"
        style={{
          padding: '0.75rem',
          backgroundColor: '#f3f4f6',
          borderRadius: 4,
          marginBottom: '0.75rem',
        }}
      >
        {t('disclaimer')}
      </Text>
      <Div
        flexGrow={1}
        flexDirection={'column'}
        minHeight={0}
        overflowY="scroll"
      >
        <ul className="lk-list lk-chat-messages" ref={ulRef}>
          {renderedMessages}
        </ul>
      </Div>
      <ChatInput
        inputRef={inputRef}
        onSubmit={(e) => handleSubmit(e)}
        isSending={isSending}
      />
    </Div>
  )
}
