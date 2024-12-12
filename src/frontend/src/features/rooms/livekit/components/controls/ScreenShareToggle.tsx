import { Div, ToggleButton } from '@/primitives'
import { RiArrowUpLine, RiCloseFill, RiRectangleLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { useTrackToggle, UseTrackToggleProps } from '@livekit/components-react'
import { Track } from 'livekit-client'
import React from 'react'
import { type ButtonRecipeProps } from '@/primitives/buttonRecipe'
import { ToggleButtonProps } from '@/primitives/ToggleButton'

type Props = Omit<
  UseTrackToggleProps<Track.Source.ScreenShare>,
  'source' | 'captureOptions'
> &
  Pick<NonNullable<ButtonRecipeProps>, 'variant'> &
  ToggleButtonProps

export const ScreenShareToggle = ({
  variant = 'primaryDark',
  onPress,
  ...props
}: Props) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.screenShare' })
  const { buttonProps, enabled } = useTrackToggle({
    ...props,
    source: Track.Source.ScreenShare,
    captureOptions: { audio: true, selfBrowserSurface: 'include' },
  })

  const tooltipLabel = enabled ? 'stop' : 'start'
  const Icon = enabled ? RiCloseFill : RiArrowUpLine

  // fixme - remove ToggleButton custom styles when we design a proper icon
  return (
    <ToggleButton
      isSelected={enabled}
      square
      variant={variant}
      tooltip={t(tooltipLabel)}
      onPress={(e) => {
        buttonProps.onClick?.(
          e as unknown as React.MouseEvent<HTMLButtonElement, MouseEvent>
        )
        onPress?.(e)
      }}
      data-attr={`controls-screenshare-${tooltipLabel}`}
      {...props}
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
