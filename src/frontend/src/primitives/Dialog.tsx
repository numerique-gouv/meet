import { useContext, type ReactNode } from 'react'
import {
  Dialog as RACDialog,
  DialogTrigger,
  Modal,
  type DialogProps as RACDialogProps,
  ModalOverlay,
  Heading,
  OverlayTriggerStateContext,
} from 'react-aria-components'
import { RiCloseLine } from '@remixicon/react'
import { styled } from '@/styled-system/jsx'
import { Box } from './Box'
import { Div } from './Div'
import { VerticallyOffCenter } from './VerticallyOffCenter'
import { text } from './Text'
import { Button } from './Button'
import { useTranslation } from 'react-i18next'

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
  },
})

// disabled pointerEvents on the stuff surrouding the overlay is there so that clicking on the overlay to close the modal still works
const StyledModal = styled(Modal, {
  base: {
    width: 'full',
    height: 'full',
    pointerEvents: 'none',
  },
})

const StyledRACDialog = styled(RACDialog, {
  base: {
    width: 'full',
    height: 'full',
    pointerEvents: 'none',
  },
})

export type DialogProps = {
  title: string
  children: [
    trigger: ReactNode,
    dialogContent:
      | (({ close }: { close: () => void }) => ReactNode)
      | ReactNode,
  ]
} & RACDialogProps

/**
 * a Dialog is a tuple of a trigger component (most usually a Button) that toggles some interactive content in a Dialog on top of the app
 */
export const Dialog = ({ title, children, ...dialogProps }: DialogProps) => {
  const { t } = useTranslation()
  const isAlert = dialogProps['role'] === 'alertdialog'
  const [trigger, dialogContent] = children
  return (
    <DialogTrigger>
      {trigger}
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
                    {typeof dialogContent === 'function'
                      ? dialogContent({ close })
                      : dialogContent}
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
    </DialogTrigger>
  )
}

export const useCloseDialog = () => {
  const dialogState = useContext(OverlayTriggerStateContext)
  if (dialogState) {
    return dialogState.close
  }
  return null
}
