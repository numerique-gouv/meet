import { useTranslation } from 'react-i18next'
import { RiMore2Line } from '@remixicon/react'
import { Button, Menu } from '@/primitives'
import { OptionsMenuItems } from '@/features/rooms/livekit/components/controls/Options/OptionsMenuItems'

export const OptionsButton = () => {
  const { t } = useTranslation('rooms')

  return (
    <>
      <Menu>
        <Button
          square
          variant="primaryDark"
          aria-label={t('options.buttonLabel')}
          tooltip={t('options.buttonLabel')}
        >
          <RiMore2Line />
        </Button>
        <OptionsMenuItems />
      </Menu>
    </>
  )
}
