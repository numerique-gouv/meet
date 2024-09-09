import { useTranslation } from 'react-i18next'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { Div, Button, type DialogProps, P } from '@/primitives'
import { HStack, styled, VStack } from '@/styled-system/jsx'
import { Heading, Dialog } from 'react-aria-components'
import { Text, text } from '@/primitives/Text'
import { RiCloseLine, RiFileCopyLine, RiSpam2Fill } from '@remixicon/react'

// fixme - extract in a proper primitive this dialog without overlay
const StyledRACDialog = styled(Dialog, {
  base: {
    position: 'fixed',
    left: '0.75rem',
    bottom: 80,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    width: '24.5rem',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow:
      '0 1px 2px 0 rgba(60, 64, 67, .3), 0 2px 6px 2px rgba(60, 64, 67, .15)',
    backgroundColor: 'white',
    '&[data-entering]': { animation: 'fade 200ms' },
    '&[data-exiting]': { animation: 'fade 150ms reverse ease-in' },
  },
})

export const InviteDialog = ({
  roomId,
  ...dialogProps
}: { roomId: string } & Omit<DialogProps, 'title'>) => {
  const { t } = useTranslation('rooms')
  const roomUrl = getRouteUrl('room', roomId)

  return (
    <StyledRACDialog {...dialogProps}>
      {({ close }) => (
        <VStack
          alignItems={'left'}
          justify="start"
          gap={0}
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Heading slot="title" level={3} className={text({ variant: 'h2' })}>
            {t('shareDialog.heading')}
          </Heading>
          <Div position="absolute" top="5" right="5">
            <Button
              invisible
              size="xs"
              onPress={() => {
                dialogProps.onClose?.()
                close()
              }}
              aria-label={t('closeDialog')}
            >
              <RiCloseLine />
            </Button>
          </Div>
          <P>{t('shareDialog.description')}</P>
          <HStack
            justify={'space-between'}
            alignItems="center"
            style={{
              backgroundColor: '#f1f3f4',
              borderRadius: '4px',
              maxWidth: '100%',
            }}
            gap={0}
          >
            <div
              style={{
                paddingLeft: '0.75rem',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                textWrap: 'nowrap',
                userSelect: 'none',
              }}
            >
              {roomUrl.replace(/^https?:\/\//, '')}
            </div>
            <Button
              square
              invisible
              tooltip={t('shareDialog.copy')}
              onPress={() => navigator.clipboard.writeText(roomUrl)}
            >
              <RiFileCopyLine size={24} />
            </Button>
          </HStack>
          <HStack>
            <div
              style={{
                backgroundColor: '#d9e5ff',
                borderRadius: '50%',
                padding: '4px',
                marginTop: '1rem',
              }}
            >
              <RiSpam2Fill size={22} style={{ fill: '#4c84fc' }} />
            </div>
            <Text variant="sm" style={{ marginTop: '1rem' }}>
              {t('shareDialog.permissions')}
            </Text>
          </HStack>
        </VStack>
      )}
    </StyledRACDialog>
  )
}
