import { styled } from '@/styled-system/jsx'
import {
  Button as RACButton,
  ButtonProps as RACButtonsProps,
} from 'react-aria-components'
import {
  TooltipWrapper,
  TooltipWrapperProps,
} from '@/primitives/TooltipWrapper'

const StyledButton = styled(RACButton, {
  base: {
    padding: '10px',
    minWidth: '24px',
    minHeight: '24px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    transition: 'background 200ms',
    '&[data-hovered]': {
      backgroundColor: '#f5f5f5',
    },
    '&[data-focused]': {
      backgroundColor: '#f5f5f5',
    },
  },
})

export const ListItemActionButton = ({
  tooltip,
  tooltipType = 'instant',
  children,
  ...props
}: RACButtonsProps & TooltipWrapperProps) => {
  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <StyledButton {...props}>{children}</StyledButton>
    </TooltipWrapper>
  )
}
