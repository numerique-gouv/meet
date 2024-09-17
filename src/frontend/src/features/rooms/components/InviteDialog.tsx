import { useTranslation } from 'react-i18next'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { Div, Button, type DialogProps, P } from '@/primitives'
import { HStack, styled, VStack } from '@/styled-system/jsx'
import { Heading, Dialog } from 'react-aria-components'
import { Text, text } from '@/primitives/Text'
import {
  RiCheckLine,
  RiCloseLine,
  RiFileCopyLine,
  RiSpam2Fill,
} from '@remixicon/react'
import { useEffect, useState } from 'react'

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

  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => setIsCopied(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [isCopied])

  const [isHovered, setIsHovered] = useState(false)

  return (
    <StyledRACDialog {...dialogProps}>
      {({ close }) => (
        <VStack
          alignItems="left"
          justify="start"
          gap={0}
          style={{ maxWidth: '100%', overflow: 'hidden' }}
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
          <Button
            variant={isCopied ? 'success' : 'primary'}
            size="sm"
            fullWidth
            aria-label={t('shareDialog.copy')}
            style={{
              justifyContent: 'start',
            }}
            onPress={() => {
              navigator.clipboard.writeText(roomUrl)
              setIsCopied(true)
            }}
            onHoverChange={setIsHovered}
            data-attr="share-dialog-copy"
          >
            {isCopied ? (
              <>
                <RiCheckLine size={18} style={{ marginRight: '8px' }} />
                {t('shareDialog.copied')}
              </>
            ) : (
              <>
                <RiFileCopyLine
                  size={18}
                  style={{ marginRight: '8px', minWidth: '18px' }}
                />
                {isHovered ? (
                  t('shareDialog.copy')
                ) : (
                  <div
                    style={{
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      userSelect: 'none',
                      textWrap: 'nowrap',
                    }}
                  >
                    {roomUrl.replace(/^https?:\/\//, '')}
                  </div>
                )}
              </>
            )}
          </Button>
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
