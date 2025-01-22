import { RiSettings3Line } from '@remixicon/react'
import { MenuItem } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { menuRecipe } from '@/primitives/menuRecipe'
import { useSettingsDialog } from '../SettingsDialogContext'

export const SettingsMenuItem = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'options.items' })
  const { setDialogOpen } = useSettingsDialog()

  return (
    <MenuItem
      className={menuRecipe({ icon: true, variant: 'dark' }).item}
      onAction={() => setDialogOpen(true)}
    >
      <RiSettings3Line size={20} />
      {t('settings')}
    </MenuItem>
  )
}
