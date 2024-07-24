import { useTranslation } from 'react-i18next'
import { RiSettings3Line } from '@remixicon/react'
import { Dialog, Button } from '@/primitives'
import { SettingsDialog } from './SettingsDialog'

export const SettingsButton = () => {
  const { t } = useTranslation('settings')
  return (
    <Dialog>
      <Button square invisible aria-label={t('settingsButtonLabel')}>
        <RiSettings3Line />
      </Button>
      <SettingsDialog />
    </Dialog>
  )
}
