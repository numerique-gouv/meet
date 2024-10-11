import type { ChatMessage, ChatOptions } from '@livekit/components-core'
import * as React from 'react'
import {
  ChatCloseIcon,
  ChatEntry,
  ChatToggle,
  MessageFormatter,
  useChat,
  useMaybeLayoutContext,
} from '@livekit/components-react'
import { cloneSingleChild } from '@/features/rooms/utils/cloneSingleChild'
import { ChatInput } from '@/features/rooms/livekit/components/chat/Input'

/** @public */
export interface ChatProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ChatOptions {
  messageFormatter?: MessageFormatter
}

/**
 * The Chat component adds a basis chat functionality to the LiveKit room. The messages are distributed to all participants
 * in the room. Only users who are in the room at the time of dispatch will receive the message.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <Chat />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function Chat({ messageFormatter, ...props }: ChatProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const ulRef = React.useRef<HTMLUListElement>(null)

  const { send, chatMessages, isSending } = useChat()

  const layoutContext = useMaybeLayoutContext()
  const lastReadMsgAt = React.useRef<ChatMessage['timestamp']>(0)

  async function handleSubmit(text: string) {
    if (!send || !text) return
    await send(text)
    inputRef?.current?.focus()
  }

  React.useEffect(() => {
    if (ulRef) {
      ulRef.current?.scrollTo({ top: ulRef.current.scrollHeight })
    }
  }, [ulRef, chatMessages])

  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) {
      return
    }

    if (
      layoutContext.widget.state?.showChat &&
      chatMessages.length > 0 &&
      lastReadMsgAt.current !== chatMessages[chatMessages.length - 1]?.timestamp
    ) {
      lastReadMsgAt.current = chatMessages[chatMessages.length - 1]?.timestamp
      return
    }

    const unreadMessageCount = chatMessages.filter(
      (msg) => !lastReadMsgAt.current || msg.timestamp > lastReadMsgAt.current
    ).length

    const { widget } = layoutContext
    if (
      unreadMessageCount > 0 &&
      widget.state?.unreadMessages !== unreadMessageCount
    ) {
      widget.dispatch?.({ msg: 'unread_msg', count: unreadMessageCount })
    }
  }, [chatMessages, layoutContext, layoutContext?.widget])

  return (
    <div {...props} className="lk-chat">
      <div className="lk-chat-header">
        Messages
        <ChatToggle className="lk-close-button">
          <ChatCloseIcon />
        </ChatToggle>
      </div>

      <ul className="lk-list lk-chat-messages" ref={ulRef}>
        {props.children
          ? chatMessages.map((msg, idx) =>
              cloneSingleChild(props.children, {
                entry: msg,
                key: msg.id ?? idx,
                messageFormatter,
              })
            )
          : chatMessages.map((msg, idx, allMsg) => {
              const hideName = idx >= 1 && allMsg[idx - 1].from === msg.from
              // If the time delta between two messages is bigger than 60s show timestamp.
              const hideTimestamp =
                idx >= 1 && msg.timestamp - allMsg[idx - 1].timestamp < 60_000

              return (
                <ChatEntry
                  key={msg.id ?? idx}
                  hideName={hideName}
                  hideTimestamp={hideName === false ? false : hideTimestamp} // If we show the name always show the timestamp as well.
                  entry={msg}
                  messageFormatter={messageFormatter}
                />
              )
            })}
      </ul>
      <ChatInput
        inputRef={inputRef}
        onSubmit={(e) => handleSubmit(e)}
        isSending={isSending}
      />
    </div>
  )
}
