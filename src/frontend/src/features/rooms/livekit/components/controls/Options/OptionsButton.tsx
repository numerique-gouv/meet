import { useTranslation } from 'react-i18next'
import { RiMore2Line } from '@remixicon/react'
import { Button, Menu } from '@/primitives'

import { useState } from 'react'
import { UsernameDialog } from '@/features/rooms/livekit/components/dialogs/UsernameDialog'
import { SettingsDialog } from '@/features/settings'
import { OptionsMenuItems } from '@/features/rooms/livekit/components/controls/Options/OptionsMenuItems'

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
      <UsernameDialog
        isOpen={dialogOpen === 'username'}
        onOpenChange={(v) => !v && setDialogOpen(null)}
      />
      <SettingsDialog
        isOpen={dialogOpen === 'settings'}
        onOpenChange={(v) => !v && setDialogOpen(null)}
      />
    </>
  )
}
