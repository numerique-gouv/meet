import { Track } from 'livekit-client'
import * as React from 'react'

import { supportsScreenSharing } from '@livekit/components-core'

import {
  DisconnectButton,
  LeaveIcon,
  MediaDeviceMenu,
  TrackToggle,
  useMaybeLayoutContext,
  usePersistentUserChoices,
} from '@livekit/components-react'

import { mergeProps } from '@/utils/mergeProps.ts'
import { StartMediaButton } from '../components/controls/StartMediaButton'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTranslation } from 'react-i18next'
import { OptionsButton } from '../components/controls/Options/OptionsButton'
import { ParticipantsToggle } from '@/features/rooms/livekit/components/controls/Participants/ParticipantsToggle'
import { ChatToggle } from '@/features/rooms/livekit/components/controls/ChatToggle'
import { HandToggle } from '@/features/rooms/livekit/components/controls/HandToggle'

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
   * This will enables the user to have the same device choices when they rejoin the room.
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
  ...props
}: ControlBarProps) {
  const { t } = useTranslation('rooms')
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

  const showIcon = React.useMemo(
    () => variation === 'minimal' || variation === 'verbose',
    [variation]
  )
  const showText = React.useMemo(
    () => variation === 'textOnly' || variation === 'verbose',
    [variation]
  )

  const browserSupportsScreenSharing = supportsScreenSharing()

  const [isScreenShareEnabled, setIsScreenShareEnabled] = React.useState(false)

  const onScreenShareChange = React.useCallback(
    (enabled: boolean) => {
      setIsScreenShareEnabled(enabled)
    },
    [setIsScreenShareEnabled]
  )

  const htmlProps = mergeProps({ className: 'lk-control-bar' }, props)

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
    <div {...htmlProps}>
      <div className="lk-button-group">
        <TrackToggle
          source={Track.Source.Microphone}
          showIcon={showIcon}
          onChange={microphoneOnChange}
          onDeviceError={(error) =>
            onDeviceError?.({ source: Track.Source.Microphone, error })
          }
        >
          {showText && t('controls.microphone')}
        </TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu
            kind="audioinput"
            onActiveDeviceChange={(_kind, deviceId) =>
              saveAudioInputDeviceId(deviceId ?? '')
            }
          />
        </div>
      </div>
      <div className="lk-button-group">
        <TrackToggle
          source={Track.Source.Camera}
          showIcon={showIcon}
          onChange={cameraOnChange}
          onDeviceError={(error) =>
            onDeviceError?.({ source: Track.Source.Camera, error })
          }
        >
          {showText && t('controls.camera')}
        </TrackToggle>
        <div className="lk-button-group-menu">
          <MediaDeviceMenu
            kind="videoinput"
            onActiveDeviceChange={(_kind, deviceId) =>
              saveVideoInputDeviceId(deviceId ?? '')
            }
          />
        </div>
      </div>
      {browserSupportsScreenSharing && (
        <TrackToggle
          source={Track.Source.ScreenShare}
          captureOptions={{ audio: true, selfBrowserSurface: 'include' }}
          showIcon={showIcon}
          onChange={onScreenShareChange}
          onDeviceError={(error) =>
            onDeviceError?.({ source: Track.Source.ScreenShare, error })
          }
        >
          {showText &&
            t(
              isScreenShareEnabled
                ? 'controls.stopScreenShare'
                : 'controls.shareScreen'
            )}
        </TrackToggle>
      )}
      <HandToggle />
      <ChatToggle />
      <ParticipantsToggle />
      <OptionsButton />
      <DisconnectButton>
        {showIcon && <LeaveIcon />}
        {showText && t('controls.leave')}
      </DisconnectButton>
      <StartMediaButton />
    </div>
  )
}
