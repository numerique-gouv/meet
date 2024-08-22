import { ParticipantTile } from './ParticipantTile'
import { FocusLayoutProps } from '@livekit/components-react'

export function FocusLayout({ trackRef, ...htmlProps }: FocusLayoutProps) {
  return <ParticipantTile trackRef={trackRef} {...htmlProps} />
}
