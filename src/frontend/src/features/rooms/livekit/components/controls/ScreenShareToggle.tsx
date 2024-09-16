import { Div, ToggleButton } from '@/primitives'
import { RiArrowUpLine, RiCloseFill, RiRectangleLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useTrackToggle, UseTrackToggleProps } from '@livekit/components-react'
import { Track } from 'livekit-client'
import React from 'react'

export const ScreenShareToggle = (
  props: Omit<
    UseTrackToggleProps<Track.Source.ScreenShare>,
    'source' | 'captureOptions'
  >
) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls' })
  const { buttonProps, enabled } = useTrackToggle({
    ...props,
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, selfBrowserSurface: 'include' },
  })

  const Icon = enabled ? RiCloseFill : RiArrowUpLine

  // fixme - remove ToggleButton custom styles when we design a proper icon
  return (
    <ToggleButton
      isSelected={enabled}
      square
      legacyStyle
      tooltip={t(enabled ? 'stopScreenShare' : 'shareScreen')}
      onPress={(e) =>
        buttonProps.onClick?.(
          e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>
        )
      }
      style={{
        maxWidth: '46px',
        maxHeight: '46px',
      }}
    >
      <Div position="relative">
        <RiRectangleLine size={28} />
        <Icon
          size={16}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </Div>
    </ToggleButton>
  )
}
