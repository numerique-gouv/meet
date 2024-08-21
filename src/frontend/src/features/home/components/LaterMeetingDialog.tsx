import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { Div, Button, Dialog, Input, type DialogProps, P } from '@/primitives'
import { HStack } from '@/styled-system/jsx'

// fixme - duplication with the InviteDialog
export const LaterMeetingDialog = ({
  roomId,
  ...dialogProps
}: { roomId: string } & Omit<DialogProps, 'title'>) => {
  const { t } = useTranslation('home')
  const roomUrl = getRouteUrl('room', roomId)
  const copyLabel = t('laterMeetingDialog.copy')
  const copiedLabel = t('laterMeetingDialog.copied')
  const [copyLinkLabel, setCopyLinkLabel] = useState(copyLabel)
  useEffect(() => {
    if (copyLinkLabel == copiedLabel) {
      const timeout = setTimeout(() => {
        setCopyLinkLabel(copyLabel)
      }, 5000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copyLinkLabel, copyLabel, copiedLabel])

  return (
    <Dialog
      isOpen={!!roomId}
      {...dialogProps}
      title={t('laterMeetingDialog.heading')}
    >
      <P>{t('laterMeetingDialog.description')}</P>
      <HStack alignItems="stretch" gap="gutter">
        <Div flex="1">
          <Input
            type="text"
            aria-label={t('laterMeetingDialog.inputLabel')}
            value={roomUrl}
            readOnly
            onClick={(e) => {
              e.currentTarget.select()
            }}
          />
        </Div>
        <Div minWidth="8rem">
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onPress={() => {
              navigator.clipboard.writeText(roomUrl)
              setCopyLinkLabel(copiedLabel)
            }}
          >
            {copyLinkLabel}
          </Button>
        </Div>
      </HStack>
    </Dialog>
  )
}
