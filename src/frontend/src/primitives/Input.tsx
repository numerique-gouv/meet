import { styled } from '@/styled-system/jsx'
import { Input as RACInput } from 'react-aria-components'

/**
 * Styled RAC Input.
 *
 * Used internally by Fields.
 */
export const Input = styled(RACInput, {
  base: {
    width: 'full',
    paddingY: 0.125,
    paddingX: 0.25,
    border: '1px solid',
    borderColor: 'control.border',
    color: 'control.text',
    borderRadius: 4,
    transition: 'all 200ms',
  },
})
