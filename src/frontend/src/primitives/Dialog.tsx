import { styled } from '@/styled-system/jsx'
import { RiCloseLine } from '@remixicon/react'
import { t } from 'i18next'
import {
  Dialog as RACDialog,
  ModalOverlay,
  Modal,
  type DialogProps as RACDialogProps,
  Heading,
} from 'react-aria-components'
import { Div, Button, Box, VerticallyOffCenter } from '@/primitives'
import { text } from './Text'
import { MutableRefObject } from 'react'

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

// disabled pointerEvents on the stuff surrounding the overlay is there so that clicking on the overlay to close the modal still works
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

export type DialogProps = RACDialogProps & {
  title?: string
  onClose?: () => void
  /**
   * use the Dialog as a controlled component
   */
  isOpen?: boolean
  /**
   * use the Dialog as a controlled component:
   * this is called when isOpen should be updated
   * after user interaction
   */
  onOpenChange?: (isOpen: boolean) => void
  type?: 'flex'
  innerRef?: MutableRefObject<HTMLDivElement | null>
}

export const Dialog = ({
  title,
  children,
  onClose,
  isOpen,
  onOpenChange,
  innerRef,
  ...dialogProps
}: DialogProps) => {
  const isAlert = dialogProps['role'] === 'alertdialog'
  const boxType = dialogProps['type'] !== 'flex' ? 'dialog' : undefined
  return (
    <StyledModalOverlay
      isKeyboardDismissDisabled={isAlert}
      isDismissable={!isAlert}
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        if (onOpenChange) {
          onOpenChange(isOpen)
        }
        if (!isOpen && onClose) {
          onClose()
        }
      }}
    >
      <StyledModal>
        <StyledRACDialog {...dialogProps}>
          {({ close }) => (
            <VerticallyOffCenter>
              <Div margin="auto" width="fit-content" maxWidth="full">
                <Div margin="1rem" pointerEvents="auto">
                  <Box size="sm" type={boxType} ref={innerRef}>
                    {!!title && (
                      <Heading
                        slot="title"
                        level={1}
                        className={text({ variant: 'h1' })}
                      >
                        {title}
                      </Heading>
                    )}
                    {typeof children === 'function'
                      ? children({ close })
                      : children}
                    {!isAlert && (
                      <Div position="absolute" top="5" right="5">
                        <Button
                          variant="tertiaryText"
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
              </Div>
            </VerticallyOffCenter>
          )}
        </StyledRACDialog>
      </StyledModal>
    </StyledModalOverlay>
  )
}
