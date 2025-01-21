import { supportsScreenSharing } from '@livekit/components-core'
import { ControlBarAuxProps } from './ControlBar'
import { css } from '@/styled-system/css'
import { LeaveButton } from '../../components/controls/LeaveButton'
import { SelectToggleDevice } from '../../components/controls/SelectToggleDevice'
import { Track } from 'livekit-client'
import { HandToggle } from '../../components/controls/HandToggle'
import { ScreenShareToggle } from '../../components/controls/ScreenShareToggle'
import { OptionsButton } from '../../components/controls/Options/OptionsButton'
import { StartMediaButton } from '../../components/controls/StartMediaButton'
import { ChatToggle } from '../../components/controls/ChatToggle'
import { ParticipantsToggle } from '../../components/controls/Participants/ParticipantsToggle'
import { SupportToggle } from '../../components/controls/SupportToggle'
import { TranscriptToggle } from '../../components/controls/TranscriptToggle'

export function DesktopControlBar({
  onDeviceError,
  microphoneOnChange,
  cameraOnChange,
  saveAudioInputDeviceId,
  saveVideoInputDeviceId,
}: ControlBarAuxProps) {
  const browserSupportsScreenSharing = supportsScreenSharing()
  return (
    <>
      <div
        className={css({
          width: '100vw',
          display: 'flex',
          position: 'absolute',
          padding: '1.125rem',
          bottom: 0,
          left: 0,
          right: 0,
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-start',
            flex: '1 1 33%',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: '0.5rem',
          })}
        ></div>
        <div
          className={css({
            flex: '1 1 33%',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            gap: '0.65rem',
          })}
        >
          <SelectToggleDevice
            source={Track.Source.Microphone}
            onChange={microphoneOnChange}
            onDeviceError={(error) =>
              onDeviceError?.({ source: Track.Source.Microphone, error })
            }
            onActiveDeviceChange={(deviceId) =>
              saveAudioInputDeviceId(deviceId ?? '')
            }
            variant="dark"
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
            variant="dark"
          />
          {browserSupportsScreenSharing && (
            <ScreenShareToggle
              onDeviceError={(error) =>
                onDeviceError?.({ source: Track.Source.ScreenShare, error })
              }
            />
          )}
          <HandToggle />
          <OptionsButton />
          <LeaveButton />
          <StartMediaButton />
        </div>
        <div
          className={css({
            display: 'flex',
            justifyContent: 'flex-end',
            flex: '1 1 33%',
            alignItems: 'center',
            gap: '0.5rem',
            paddingRight: '0.25rem',
          })}
        >
          <ChatToggle />
          <ParticipantsToggle />
          <TranscriptToggle />
          <SupportToggle />
        </div>
      </div>
    </>
  )
}
