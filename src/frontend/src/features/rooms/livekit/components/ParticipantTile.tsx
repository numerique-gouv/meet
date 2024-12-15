import {
  AudioTrack,
  ConnectionQualityIndicator,
  FocusToggle,
  LockLockedIcon,
  ParticipantName,
  ParticipantTileProps,
  ScreenShareIcon,
  useEnsureTrackRef,
  useFeatureContext,
  useIsEncrypted,
  useMaybeLayoutContext,
  useMaybeTrackRefContext,
  useParticipantTile,
  VideoTrack,
  TrackRefContext,
  ParticipantContextIfNeeded,
} from '@livekit/components-react'
import React from 'react'
import {
  isTrackReference,
  isTrackReferencePinned,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-core'
import { Track } from 'livekit-client'
import { ParticipantPlaceholder } from '@/features/rooms/livekit/components/ParticipantPlaceholder'
import { RiHand } from '@remixicon/react'
import { useRaisedHand } from '@/features/rooms/livekit/hooks/useRaisedHand'
import { HStack } from '@/styled-system/jsx'
import { MutedMicIndicator } from '@/features/rooms/livekit/components/MutedMicIndicator'
import { FullscreenToggle } from '@/features/rooms/livekit/components/controls/FullscreenToggle'

export function TrackRefContextIfNeeded(
  props: React.PropsWithChildren<{
    trackRef?: TrackReferenceOrPlaceholder
  }>
) {
  const hasContext = !!useMaybeTrackRefContext()
  return props.trackRef && !hasContext ? (
    <TrackRefContext.Provider value={props.trackRef}>
      {props.children}
    </TrackRefContext.Provider>
  ) : (
    <>{props.children}</>
  )
}

interface ParticipantTileExtendedProps extends ParticipantTileProps {
  disableMetadata?: boolean
}

export const ParticipantTile: (
  props: ParticipantTileExtendedProps & React.RefAttributes<HTMLDivElement>
) => React.ReactNode = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  ParticipantTileExtendedProps
>(function ParticipantTile(
  {
    trackRef,
    children,
    onParticipantClick,
    disableSpeakingIndicator,
    disableMetadata,
    ...htmlProps
  }: ParticipantTileExtendedProps,
  ref
) {
  const trackReference = useEnsureTrackRef(trackRef)

  const { elementProps } = useParticipantTile<HTMLDivElement>({
    htmlProps,
    disableSpeakingIndicator,
    onParticipantClick,
    trackRef: trackReference,
  })
  const isEncrypted = useIsEncrypted(trackReference.participant)
  const layoutContext = useMaybeLayoutContext()

  const autoManageSubscription = useFeatureContext()?.autoSubscription

  const handleSubscribe = React.useCallback(
    (subscribed: boolean) => {
      if (
        trackReference.source &&
        !subscribed &&
        layoutContext &&
        layoutContext.pin.dispatch &&
        isTrackReferencePinned(trackReference, layoutContext.pin.state)
      ) {
        layoutContext.pin.dispatch({ msg: 'clear_pin' })
      }
    },
    [trackReference, layoutContext]
  )

  const { isHandRaised } = useRaisedHand({
    participant: trackReference.participant,
  })

  return (
    <div ref={ref} style={{ position: 'relative' }} {...elementProps}>
      <TrackRefContextIfNeeded trackRef={trackReference}>
        <ParticipantContextIfNeeded participant={trackReference.participant}>
          {children ?? (
            <>
              {isTrackReference(trackReference) &&
              (trackReference.publication?.kind === 'video' ||
                trackReference.source === Track.Source.Camera ||
                trackReference.source === Track.Source.ScreenShare) ? (
                <VideoTrack
                  trackRef={trackReference}
                  onSubscriptionStatusChanged={handleSubscribe}
                  manageSubscription={autoManageSubscription}
                />
              ) : (
                isTrackReference(trackReference) && (
                  <AudioTrack
                    trackRef={trackReference}
                    onSubscriptionStatusChanged={handleSubscribe}
                  />
                )
              )}
              <div className="lk-participant-placeholder">
                <ParticipantPlaceholder
                  participant={trackReference.participant}
                />
              </div>
              {!disableMetadata && (
                <div className="lk-participant-metadata">
                  <HStack gap={0.25}>
                    <MutedMicIndicator
                      participant={trackReference.participant}
                    />
                    <div
                      className="lk-participant-metadata-item"
                      style={{
                        minHeight: '24px',
                        backgroundColor: isHandRaised ? 'white' : undefined,
                        color: isHandRaised ? 'black' : undefined,
                        transition: 'background 200ms ease, color 400ms ease',
                      }}
                    >
                      {trackReference.source === Track.Source.Camera ? (
                        <>
                          {isHandRaised && (
                            <RiHand
                              color="black"
                              size={16}
                              style={{
                                marginInlineEnd: '.25rem', // fixme - match TrackMutedIndicator styling
                                animationDuration: '300ms',
                                animationName: 'wave_hand',
                                animationIterationCount: '2',
                              }}
                            />
                          )}
                          {isEncrypted && (
                            <LockLockedIcon
                              style={{ marginRight: '0.25rem' }}
                            />
                          )}
                          <ParticipantName />
                        </>
                      ) : (
                        <>
                          <ScreenShareIcon style={{ marginRight: '0.25rem' }} />
                          <ParticipantName>&apos;s screen</ParticipantName>
                        </>
                      )}
                    </div>
                  </HStack>
                  <ConnectionQualityIndicator className="lk-participant-metadata-item" />
                </div>
              )}
            </>
          )}
          {!disableMetadata && <FocusToggle trackRef={trackReference} />}
          {!disableMetadata && <FullscreenToggle trackRef={trackReference} />}
        </ParticipantContextIfNeeded>
      </TrackRefContextIfNeeded>
    </div>
  )
})
