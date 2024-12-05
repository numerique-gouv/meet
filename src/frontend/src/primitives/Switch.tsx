import {
  Switch as RACSwitch,
  SwitchProps as RACSwitchProps,
} from 'react-aria-components'
import { styled } from '@/styled-system/jsx'
import { StyledVariantProps } from '@/styled-system/types'
import { ReactNode } from 'react'

export const StyledSwitch = styled(RACSwitch, {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.571rem',
    color: 'black',
    forcedColorAdjust: 'none',
    '& .indicator': {
      width: '2.6rem',
      height: '1.563rem',
      border: '0.125rem solid',
      borderColor: 'primary.800',
      borderRadius: '1.143rem',
      transition: 'all 200ms, outline 200ms',
      _before: {
        content: '""',
        display: 'block',
        margin: '0.125rem',
        width: '1.063rem',
        height: '1.063rem',
        borderRadius: '1.063rem',
        background: 'primary.800',
        transition: 'all 200ms',
      },
    },
    '&[data-selected] .indicator': {
      borderColor: 'primary.800',
      background: 'primary.800',
      _before: {
        background: 'white',
        transform: 'translateX(100%)',
      },
    },
    '&[data-disabled] .indicator': {
      borderColor: 'primary.200',
      background: 'transparent',
      _before: {
        background: 'primary.200',
      },
    },
    '&[data-focus-visible] .indicator': {
      outline: '2px solid!',
      outlineColor: 'focusRing!',
      outlineOffset: '2px!',
    },
  },
  variants: {},
})

export type SwitchProps = StyledVariantProps<typeof StyledSwitch> &
  RACSwitchProps & { children: ReactNode }

/**
 * Styled RAC Switch.
 */
export const Switch = ({ children, ...props }: SwitchProps) => (
  <StyledSwitch {...props}>
    <div className="indicator" />
    {children}
  </StyledSwitch>
)
