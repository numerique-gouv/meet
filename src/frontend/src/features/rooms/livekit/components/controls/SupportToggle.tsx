import { ToggleButton } from '@/primitives'
import { RiQuestionLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { Crisp } from 'crisp-sdk-web'
import { useEffect, useState } from 'react'
import { ToggleButtonProps } from '@/primitives/ToggleButton'

export const SupportToggle = ({ onPress, ...props }: ToggleButtonProps) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls' })
  const [isOpened, setIsOpened] = useState(() => {
    return window?.$crisp?.is?.('chat:opened') || false
  })

  useEffect(() => {
    if (!Crisp) {
      return
    }

    Crisp.chat.onChatOpened(() => {
      setIsOpened(true)
    })
    Crisp.chat.onChatClosed(() => {
      setIsOpened(false)
    })
    return () => {
      Crisp.chat.offChatOpened()
      Crisp.chat.offChatClosed()
    }
  }, [])

  return (
    <ToggleButton
      square
      variant="primaryTextDark"
      tooltip={t('support')}
      aria-label={t('support')}
      isSelected={isOpened}
      onPress={(e) => {
        if (isOpened) {
          Crisp.chat.close()
        } else {
          Crisp.chat.open()
        }
        onPress?.(e)
      }}
      data-attr="controls-support"
      {...props}
    >
      <RiQuestionLine />
    </ToggleButton>
  )
}
