import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { Div, Button, Dialog, Input, type DialogProps } from '@/primitives'
import { HStack } from '@/styled-system/jsx'

export const InviteDialog = ({
  roomId,
  ...dialogProps
}: { roomId: string } & Omit<DialogProps, 'title'>) => {
  const { t } = useTranslation('rooms')
  const roomUrl = getRouteUrl('room', roomId)

  const copyLabel = t('shareDialog.copy')
  const copiedLabel = t('shareDialog.copied')
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
    <Dialog {...dialogProps} title={t('shareDialog.heading')}>
      <HStack alignItems="stretch" gap="gutter">
        <Div flex="1">
          <Input
            type="text"
            aria-label={t('shareDialog.inputLabel')}
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
