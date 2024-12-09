import { supportsScreenSharing } from '@livekit/components-core'
import { useTranslation } from 'react-i18next'
import { ControlBarAuxProps } from './ControlBar'
import React, { PropsWithChildren } from 'react'
import { css } from '@/styled-system/css'
import { LeaveButton } from '../../components/controls/LeaveButton'
import { SelectToggleDevice } from '../../components/controls/SelectToggleDevice'
import { Track } from 'livekit-client'
import { HandToggle } from '../../components/controls/HandToggle'
import { Button } from '@/primitives/Button'
import { RiMore2Line } from '@remixicon/react'
import { Dialog, Modal, ModalOverlay } from 'react-aria-components'
import { ScreenShareToggle } from '../../components/controls/ScreenShareToggle'
import { ChatToggle } from '../../components/controls/ChatToggle'
import { ParticipantsToggle } from '../../components/controls/Participants/ParticipantsToggle'
import { SupportToggle } from '../../components/controls/SupportToggle'

export function MobileControlBar({
  onDeviceError,
  microphoneOnChange,
  cameraOnChange,
  saveAudioInputDeviceId,
  saveVideoInputDeviceId,
}: ControlBarAuxProps) {
  const { t } = useTranslation('rooms')
  const [isMenuOpened, setIsMenuOpened] = React.useState(false)
  const browserSupportsScreenSharing = supportsScreenSharing()
  return (
    <>
      <div
        className={css({
          width: '100vw',
          display: 'flex',
          position: 'absolute',
          padding: '1.125rem',
          justifyContent: 'center',
          bottom: 0,
          left: 0,
          right: 0,
          hideFrom: 'md',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            width: '422px',
          })}
        >
          <LeaveButton />
          <SelectToggleDevice
            source={Track.Source.Microphone}
            onChange={microphoneOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Microphone, error })
            }
            onActiveDeviceChange={(deviceId) =>
              saveAudioInputDeviceId(deviceId ?? '')
            }
          />
          <SelectToggleDevice
            source={Track.Source.Camera}
            onChange={cameraOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Camera, error })
            }
            onActiveDeviceChange={(deviceId) =>
              saveVideoInputDeviceId(deviceId ?? '')
            }
          />
          <HandToggle />
          <Button
            square
            variant="primaryDark"
            aria-label={t('options.buttonLabel')}
            tooltip={t('options.buttonLabel')}
            onPress={() => setIsMenuOpened(true)}
          >
            <RiMore2Line />
          </Button>
        </div>
      </div>
      <ResponsiveMenu
        isOpened={isMenuOpened}
        onClosed={() => setIsMenuOpened(false)}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
          })}
        >
          <div
            className={css({
              //   display: 'flex',
              //   gap: '2rem',
              //   flexWrap: 'wrap',
              //   justifyContent: 'space-between',
              //   alignItems: 'flex-end',
              flexGrow: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gridGap: '1rem',
              '& > *': {
                alignSelf: 'center',
                justifySelf: 'center',
              },
            })}
          >
            {browserSupportsScreenSharing && (
              <ScreenShareToggle
                onDeviceError={(error) =>
                  onDeviceError?.({ source: Track.Source.ScreenShare, error })
                }
                variant="primaryTextDark"
                description={true}
              />
            )}
            <ChatToggle description={true} />
            <ParticipantsToggle description={true} />
            <SupportToggle description={true} />
          </div>
        </div>
      </ResponsiveMenu>
    </>
  )
}

interface ResponsiveMenuProps extends PropsWithChildren {
  isOpened: boolean
  onClosed: () => void
}

function ResponsiveMenu({ isOpened, onClosed, children }: ResponsiveMenuProps) {
  return (
    <ModalOverlay
      isDismissable
      isOpen={isOpened}
      onOpenChange={(isOpened) => {
        if (!isOpened) {
          onClosed()
        }
      }}
      className={css({
        width: '100vw',
        height: 'var(--visual-viewport-height)',
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'flex-end',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        padding: '1.5rem 1.5rem 1rem 1.5rem',
        boxSizing: 'border-box',
      })}
    >
      <Modal
        className={css({
          backgroundColor: 'primaryDark.200',
          borderRadius: '20px',
          flexGrow: 1,
          padding: '1.5rem',
          '&[data-entering]': {
            animation: 'slide 200ms',
          },
          '&[data-exiting]': {
            animation: 'slide 200ms reverse',
          },
        })}
      >
        <Dialog>{children}</Dialog>
      </Modal>
    </ModalOverlay>
  )
}
