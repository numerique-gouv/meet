import { supportsScreenSharing } from '@livekit/components-core'
import { useTranslation } from 'react-i18next'
import { ControlBarAuxProps } from './ControlBar'
import React from 'react'
import { css } from '@/styled-system/css'
import { LeaveButton } from '../../components/controls/LeaveButton'
import { SelectToggleDevice } from '../../components/controls/SelectToggleDevice'
import { Track } from 'livekit-client'
import { HandToggle } from '../../components/controls/HandToggle'
import { Button } from '@/primitives/Button'
import {
  RiAccountBoxLine,
  RiMegaphoneLine,
  RiMore2Line,
  RiSettings3Line,
} from '@remixicon/react'
import { ScreenShareToggle } from '../../components/controls/ScreenShareToggle'
import { ChatToggle } from '../../components/controls/ChatToggle'
import { ParticipantsToggle } from '../../components/controls/Participants/ParticipantsToggle'
import { SupportToggle } from '../../components/controls/SupportToggle'
import { useSidePanel } from '../../hooks/useSidePanel'
import { LinkButton } from '@/primitives'
import { useSettingsDialog } from '../../components/controls/SettingsDialogContext'
import { ResponsiveMenu } from './ResponsiveMenu'
import { TranscriptToggle } from '../../components/controls/TranscriptToggle'
import { CameraSwitchButton } from '../../components/controls/CameraSwitchButton'

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
  const { toggleEffects } = useSidePanel()
  const { setDialogOpen } = useSettingsDialog()

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
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            width: '330px',
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
            hideMenu={true}
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
            hideMenu={true}
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
                onPress={() => setIsMenuOpened(false)}
              />
            )}
            <ChatToggle
              description={true}
              onPress={() => setIsMenuOpened(false)}
            />
            <ParticipantsToggle
              description={true}
              onPress={() => setIsMenuOpened(false)}
            />
            <TranscriptToggle
              description={true}
              onPress={() => setIsMenuOpened(false)}
            />
            <SupportToggle
              description={true}
              onPress={() => setIsMenuOpened(false)}
            />
            <Button
              onPress={() => {
                toggleEffects()
                setIsMenuOpened(false)
              }}
              variant="primaryTextDark"
              aria-label={t('options.items.effects')}
              tooltip={t('options.items.effects')}
              description={true}
            >
              <RiAccountBoxLine size={20} />
            </Button>
            <LinkButton
              href="https://grist.incubateur.net/o/docs/forms/1YrfNP1QSSy8p2gCxMFnSf/4"
              variant="primaryTextDark"
              tooltip={t('options.items.feedback')}
              aria-label={t('options.items.feedback')}
              description={true}
              target="_blank"
              onPress={() => setIsMenuOpened(false)}
            >
              <RiMegaphoneLine size={20} />
            </LinkButton>
            <Button
              onPress={() => {
                setDialogOpen(true)
                setIsMenuOpened(false)
              }}
              variant="primaryTextDark"
              aria-label={t('options.items.settings')}
              tooltip={t('options.items.settings')}
              description={true}
            >
              <RiSettings3Line size={20} />
            </Button>
            <CameraSwitchButton onPress={() => setIsMenuOpened(false)} />
          </div>
        </div>
      </ResponsiveMenu>
    </>
  )
}
