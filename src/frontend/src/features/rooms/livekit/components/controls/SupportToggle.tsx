import { ToggleButton } from '@/primitives'
import { RiQuestionLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { Crisp } from 'crisp-sdk-web'
import { useEffect, useState } from 'react'

export const SupportToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls' })
  const [isOpened, setIsOpened] = useState($crisp.is('chat:opened'))

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
      onPress={() => (isOpened ? Crisp.chat.close() : Crisp.chat.open())}
      data-attr="controls-support"
    >
      <RiQuestionLine />
    </ToggleButton>
  )
}
