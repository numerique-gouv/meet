import { styled } from '@/styled-system/jsx'
import { Separator as RACSeparator } from 'react-aria-components'

export const Separator = styled(RACSeparator, {
  base: {
    height: '1px',
    background: 'primaryDark.200',
    margin: '4px 0',
  },
})
