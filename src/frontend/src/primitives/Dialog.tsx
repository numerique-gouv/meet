import { styled } from '@/styled-system/jsx'
import { RiCloseLine } from '@remixicon/react'
import { t } from 'i18next'
import {
  Dialog as RACDialog,
  ModalOverlay,
  Modal,
  type DialogProps,
  Heading,
} from 'react-aria-components'
import { Div, Button, Box, VerticallyOffCenter } from '@/primitives'
import { text } from './Text'

const StyledModalOverlay = styled(ModalOverlay, {
  base: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    '&[data-entering]': { animation: 'fade 200ms' },
    '&[data-exiting]': { animation: 'fade 150ms reverse ease-in' },
  },
})

// disabled pointerEvents on the stuff surrouding the overlay is there so that clicking on the overlay to close the modal still works
const StyledModal = styled(Modal, {
  base: {
    width: 'full',
    height: 'full',
    pointerEvents: 'none',
    '--origin': 'translateY(32px)',
    '&[data-entering]': { animation: 'slide 300ms' },
  },
})

const StyledRACDialog = styled(RACDialog, {
  base: {
    width: 'full',
    height: 'full',
    pointerEvents: 'none',
  },
})
export const Dialog = ({
  title,
  children,
  ...dialogProps
}: DialogProps & { title: string }) => {
  const isAlert = dialogProps['role'] === 'alertdialog'
  return (
    <StyledModalOverlay
      isKeyboardDismissDisabled={isAlert}
      isDismissable={!isAlert}
    >
      <StyledModal>
        <StyledRACDialog {...dialogProps}>
          {({ close }) => (
            <VerticallyOffCenter>
              <Div
                width="fit-content"
                maxWidth="full"
                margin="auto"
                pointerEvents="auto"
              >
                <Box size="sm" type="dialog">
                  <Heading
                    slot="title"
                    level={1}
                    className={text({ variant: 'h1' })}
                  >
                    {title}
                  </Heading>
                  {typeof children === 'function'
                    ? children({ close })
                    : children}
                  {!isAlert && (
                    <Div position="absolute" top="0" right="0">
                      <Button
                        invisible
                        size="xs"
                        onPress={() => close()}
                        aria-label={t('closeDialog')}
                      >
                        <RiCloseLine />
                      </Button>
                    </Div>
                  )}
                </Box>
              </Div>
            </VerticallyOffCenter>
          )}
        </StyledRACDialog>
      </StyledModal>
    </StyledModalOverlay>
  )
}
