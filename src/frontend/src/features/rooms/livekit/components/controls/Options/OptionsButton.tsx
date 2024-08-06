import { useTranslation } from 'react-i18next'
import { RiMore2Line } from '@remixicon/react'
import { Button } from '@/primitives'
import { OptionsMenu } from '@/features/rooms/livekit/components/controls/Options/OptionsMenu.tsx'
import { MenuTrigger } from 'react-aria-components'

export const OptionsButton = () => {
  const { t } = useTranslation('rooms')
  return (
    <MenuTrigger>
      <Button
        square
        legacyStyle
        aria-label={t('options.buttonLabel')}
        tooltip={t('options.buttonLabel')}
      >
        <RiMore2Line />
      </Button>
      <OptionsMenu />
    </MenuTrigger>
  )
}
