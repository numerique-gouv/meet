import { Track } from 'livekit-client'
import * as React from 'react'

import { supportsScreenSharing } from '@livekit/components-core'

import {
  useMaybeLayoutContext,
  usePersistentUserChoices,
} from '@livekit/components-react'

import { StartMediaButton } from '../components/controls/StartMediaButton'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { OptionsButton } from '../components/controls/Options/OptionsButton'
import { ParticipantsToggle } from '../components/controls/Participants/ParticipantsToggle'
import { ChatToggle } from '../components/controls/ChatToggle'
import { HandToggle } from '../components/controls/HandToggle'
import { SelectToggleDevice } from '../components/controls/SelectToggleDevice'
import { LeaveButton } from '../components/controls/LeaveButton'
import { ScreenShareToggle } from '../components/controls/ScreenShareToggle'
import { ActivitiesToggle } from '../components/controls/ActivitiesToggle'
import { css } from '@/styled-system/css'

/** @public */
export type ControlBarControls = {
  microphone?: boolean
  camera?: boolean
  chat?: boolean
  screenShare?: boolean
  leave?: boolean
  settings?: boolean
}

/** @public */
export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void
  variation?: 'minimal' | 'verbose' | 'textOnly'
  controls?: ControlBarControls
  /**
   * If `true`, the user's device choices will be persisted.
   * This will enable the user to have the same device choices when they rejoin the room.
   * @defaultValue true
   * @alpha
   */
  saveUserChoices?: boolean
}

/**
 * The `ControlBar` prefab gives the user the basic user interface to control their
 * media devices (camera, microphone and screen share), open the `Chat` and leave the room.
 *
 * @remarks
 * This component is build with other LiveKit components like `TrackToggle`,
 * `DeviceSelectorButton`, `DisconnectButton` and `StartAudio`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <ControlBar />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function ControlBar({
  variation,
  saveUserChoices = true,
  onDeviceError,
}: ControlBarProps) {
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const layoutContext = useMaybeLayoutContext()
  React.useEffect(() => {
    if (layoutContext?.widget.state?.showChat !== undefined) {
      setIsChatOpen(layoutContext?.widget.state?.showChat)
    }
  }, [layoutContext?.widget.state?.showChat])

  const isTooLittleSpace = useMediaQuery(
    `(max-width: ${isChatOpen ? 1000 : 760}px)`
  )

  const defaultVariation = isTooLittleSpace ? 'minimal' : 'verbose'
  variation ??= defaultVariation

  const browserSupportsScreenSharing = supportsScreenSharing()

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices })

  const microphoneOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveAudioInputEnabled(enabled) : null,
    [saveAudioInputEnabled]
  )

  const cameraOnChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) =>
      isUserInitiated ? saveVideoInputEnabled(enabled) : null,
    [saveVideoInputEnabled]
  )

  return (
    <div
      className={css({
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '.75rem',
        maxHeight: 'var(--lk-control-bar-height)',
        height: '80px',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
      })}
    >
      <div
        className={css({
          display: 'flex',
          gap: '.5rem',
          alignItems: 'center',
          lg: {
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          },
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
          gap: '.5rem',
          alignItems: 'center',
          marginRight: '6.25rem',
          lg: {
            position: 'absolute',
            right: 0,
          },
        })}
      >
        <ChatToggle />
        <ParticipantsToggle />
        <ActivitiesToggle />
      </div>
    </div>
  )
}
