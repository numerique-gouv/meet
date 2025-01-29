import { useTranslation } from 'react-i18next'
import { Button, Dialog, P } from '@/primitives'
import { HStack } from '@/styled-system/jsx'

export const MuteAlertDialog = ({
  isOpen,
  onClose,
  onSubmit,
  name,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  name: string
}) => {
  const { t } = useTranslation('rooms')
  return (
    <Dialog isOpen={isOpen} role="alertdialog">
      <P>{t('participants.muteParticipantAlert.description', { name })}</P>
      <HStack gap={1}>
        <Button variant="text" size="sm" onPress={onClose}>
          {t('participants.muteParticipantAlert.cancel')}
        </Button>
        <Button variant="text" size="sm" onPress={onSubmit}>
          {t('participants.muteParticipantAlert.confirm')}
        </Button>
      </HStack>
    </Dialog>
  )
}
