import { OverlayArrow, Tooltip as RACTooltip } from 'react-aria-components'
import { styled } from '@/styled-system/jsx'

/**
 * Styled react aria Tooltip component.
 *
 * Note that tooltips are directly handled by Buttons via the `tooltip` prop,
 * so you should not need to use this component directly.
 *
 * Style taken from example at https://react-spectrum.adobe.com/react-aria/Tooltip.html
 */
export const Tooltip = styled(RACTooltip, {
  base: {
    boxShadow: '0 8px 20px rgba(0 0 0 / 0.1)',
    borderRadius: '4px',
    backgroundColor: 'gray.800',
    color: 'gray.100',
    forcedColorAdjust: 'none',
    outline: 'none',
    padding: '2px 8px',
    maxWidth: '150px',
    transform: 'translate3d(0, 0, 0)',
    '&[data-placement=top]': {
      marginBottom: '8px',
      '--origin': 'translateY(4px)',
    },
    '&[data-placement=bottom]': {
      marginTop: '8px',
      '--origin': 'translateY(-4px)',
    },
    '&[data-placement=right]': {
      marginLeft: '8px',
      '--origin': 'translateX(-4px)',
    },
    '&[data-placement=left]': {
      marginRight: '8px',
      '--origin': 'translateX(4px)',
    },
    '& .react-aria-OverlayArrow svg': {
      display: 'block',
      fill: 'var(--highlight-background)',
    },
    '&[data-entering]': { animation: 'slide 200ms' },
    '&[data-exiting]': { animation: 'slide 200ms reverse ease-in' },
  },
})

const StyledOverlayArrow = styled(OverlayArrow, {
  base: {
    '& svg': {
      display: 'block',
      fill: 'gray.800',
    },
    '&[data-placement=bottom] svg': {
      transform: 'rotate(180deg)',
    },
    '&[data-placement=right] svg': {
      transform: 'rotate(90deg)',
    },
    '&[data-placement=left] svg': {
      transform: 'rotate(-90deg)',
    },
  },
})

export const TooltipArrow = () => {
  return (
    <StyledOverlayArrow>
      <svg width={8} height={8} viewBox="0 0 8 8">
        <path d="M0 0 L4 4 L8 0" />
      </svg>
    </StyledOverlayArrow>
  )
}
