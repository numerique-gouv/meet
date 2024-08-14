import { useTranslation } from 'react-i18next'
import { RiMore2Line } from '@remixicon/react'
import { Button, Menu } from '@/primitives'

import { useState } from 'react'
import { OptionsMenuItems } from '@/features/rooms/livekit/components/controls/Options/OptionsMenuItems'
import { SettingsDialogExtended } from '@/features/settings/components/SettingsDialogExtended'

export type DialogState = 'username' | 'settings' | null

export const OptionsButton = () => {
  const { t } = useTranslation('rooms')
  const [dialogOpen, setDialogOpen] = useState<DialogState>(null)
  return (
    <>
      <Menu>
        <Button
          square
          legacyStyle
          aria-label={t('options.buttonLabel')}
          tooltip={t('options.buttonLabel')}
        >
          <RiMore2Line />
        </Button>
        <OptionsMenuItems onOpenDialog={setDialogOpen} />
      </Menu>
      <SettingsDialogExtended
        isOpen={dialogOpen === 'settings'}
        onOpenChange={(v) => !v && setDialogOpen(null)}
      />
    </>
  )
}
