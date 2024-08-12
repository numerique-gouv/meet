import type {
  MessageDecoder,
  MessageEncoder,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from '@livekit/components-core'
import {
  isEqualTrackRef,
  isTrackReference,
  isWeb,
  log,
} from '@livekit/components-core'
import { RoomEvent, Track } from 'livekit-client'
import * as React from 'react'

import {
  CarouselLayout,
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
  MessageFormatter,
  usePinnedTracks,
  useTracks,
  useCreateLayoutContext,
  Chat,
} from '@livekit/components-react'

import { ControlBar } from './ControlBar'
import { styled } from '@/styled-system/jsx'
import { cva } from '@/styled-system/css'
import { ParticipantsList } from '@/features/rooms/livekit/components/controls/Participants/ParticipantsList'
import { useSnapshot } from 'valtio'
import { participantsStore } from '@/stores/participants'

const LayoutWrapper = styled(
  'div',
  cva({
    base: {
      position: 'relative',
      display: 'flex',
      width: '100%',
      height: 'calc(100% - var(--lk-control-bar-height))',
    },
  })
)

/**
 * @public
 */
export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter
  chatMessageEncoder?: MessageEncoder
  chatMessageDecoder?: MessageDecoder
  /** @alpha */
  SettingsComponent?: React.ComponentType
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, basic non-persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use this components as a starting point for your own custom video conferencing application.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
  chatMessageFormatter,
  chatMessageDecoder,
  chatMessageEncoder,
  ...props
}: VideoConferenceProps) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  })
  const lastAutoFocusedScreenShareTrack =
    React.useRef<TrackReferenceOrPlaceholder | null>(null)

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  )

  const widgetUpdate = (state: WidgetState) => {
    log.debug('updating widget state', state)
    setWidgetState(state)
  }

  const layoutContext = useCreateLayoutContext()

  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare)

  const focusTrack = usePinnedTracks(layoutContext)?.[0]
  const carouselTracks = tracks.filter(
    (track) => !isEqualTrackRef(track, focusTrack)
  )

  /* eslint-disable react-hooks/exhaustive-deps */
  // Code duplicated from LiveKit; this warning will be addressed in the refactoring.
  React.useEffect(() => {
    // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      log.debug('Auto set screen share focus:', {
        newScreenShareTrack: screenShareTracks[0],
      })
      layoutContext.pin.dispatch?.({
        msg: 'set_pin',
        trackReference: screenShareTracks[0],
      })
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0]
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid
      )
    ) {
      log.debug('Auto clearing screen share focus.')
      layoutContext.pin.dispatch?.({ msg: 'clear_pin' })
      lastAutoFocusedScreenShareTrack.current = null
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source
      )
      if (
        updatedFocusTrack !== focusTrack &&
        isTrackReference(updatedFocusTrack)
      ) {
        layoutContext.pin.dispatch?.({
          msg: 'set_pin',
          trackReference: updatedFocusTrack,
        })
      }
    }
  }, [
    screenShareTracks
      .map(
        (ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`
      )
      .join(),
    focusTrack?.publication?.trackSid,
    tracks,
  ])
  /* eslint-enable react-hooks/exhaustive-deps */

  const participantsSnap = useSnapshot(participantsStore)
  const showParticipants = participantsSnap.showParticipants

  return (
    <div className="lk-video-conference" {...props}>
      {isWeb() && (
        <LayoutContextProvider
          value={layoutContext}
          // onPinChange={handleFocusStateChange}
          onWidgetChange={widgetUpdate}
        >
          <div className="lk-video-conference-inner">
            <LayoutWrapper>
              {!focusTrack ? (
                <div
                  className="lk-grid-layout-wrapper"
                  style={{ height: 'auto' }}
                >
                  <GridLayout tracks={tracks}>
                    <ParticipantTile />
                  </GridLayout>
                </div>
              ) : (
                <div className="lk-focus-layout-wrapper">
                  <FocusLayoutContainer>
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile />
                    </CarouselLayout>
                    {focusTrack && <FocusLayout trackRef={focusTrack} />}
                  </FocusLayoutContainer>
                </div>
              )}
              <Chat
                style={{ display: widgetState.showChat ? 'grid' : 'none' }}
                messageFormatter={chatMessageFormatter}
                messageEncoder={chatMessageEncoder}
                messageDecoder={chatMessageDecoder}
              />
              {showParticipants && <ParticipantsList />}
            </LayoutWrapper>
            <ControlBar />
          </div>
        </LayoutContextProvider>
      )}
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  )
}
