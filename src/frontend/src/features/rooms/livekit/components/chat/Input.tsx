import { Button } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { RiSendPlane2Fill } from '@remixicon/react'
import { useState, useEffect } from 'react'
import { TextArea } from '@/primitives/TextArea'
import { RefObject } from 'react'
import { useTranslation } from 'react-i18next'

const MAX_ROWS = 6

interface ChatInputProps {
  inputRef: RefObject<HTMLTextAreaElement>
  onSubmit: (text: string) => void
  isSending: boolean
}

export const ChatInput = ({
  inputRef,
  onSubmit,
  isSending,
}: ChatInputProps) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.chat.input' })
  const [text, setText] = useState('')
  const [rows, setRows] = useState(1)

  const handleSubmit = () => {
    onSubmit(text)
    setText('')
  }

  const isDisabled = !text.trim() || isSending

  const submitOnEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || (e.key === 'Enter' && e.shiftKey)) return
    e.preventDefault()
    if (!isDisabled) handleSubmit()
  }

  useEffect(() => {
    const resize = () => {
      if (!inputRef.current) return

      const textAreaLineHeight = 20 // Adjust this value based on your TextArea's line height
      const previousRows = inputRef.current.rows
      inputRef.current.rows = 1

      const currentRows = Math.floor(
        inputRef.current.scrollHeight / textAreaLineHeight
      )

      if (currentRows === previousRows) {
        inputRef.current.rows = currentRows
      }

      if (currentRows >= MAX_ROWS) {
        inputRef.current.rows = MAX_ROWS
        inputRef.current.scrollTop = inputRef.current.scrollHeight
      }

      if (currentRows < MAX_ROWS) {
        inputRef.current.style.overflowY = 'hidden'
      } else {
        inputRef.current.style.overflowY = 'auto'
      }

      setRows(currentRows < MAX_ROWS ? currentRows : MAX_ROWS)
    }

    resize()
  }, [text, inputRef])

  return (
    <HStack
      style={{
        margin: '0.75rem 0 1.5rem',
        padding: '0.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: 4,
      }}
    >
      <TextArea
        ref={inputRef}
        onKeyDown={(e) => {
          e.stopPropagation()
          submitOnEnter(e)
        }}
        onKeyUp={(e) => e.stopPropagation()}
        placeholder={t('textArea.placeholder')}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
        }}
        rows={rows || 1}
        style={{
          border: 'none',
          resize: 'none',
          height: 'auto',
          minHeight: `34px`,
          lineHeight: 1.25,
          padding: '7px 10px',
          overflowY: 'hidden',
        }}
        placeholderStyle={'strong'}
        spellCheck={false}
        maxLength={500}
        aria-label={t('textArea.label')}
      />
      <Button
        square
        invisible
        size="sm"
        onPress={handleSubmit}
        isDisabled={isDisabled}
        aria-label={t('button.label')}
      >
        <RiSendPlane2Fill />
      </Button>
    </HStack>
  )
}
