import type { ReactNode } from 'react'
import { Div, VerticallyOffCenter } from '@/primitives'
import type { SystemStyleObject } from '../styled-system/types'

export const Centered = ({
  width = '38rem',
  children,
}: {
  width?: SystemStyleObject['width']
  children?: ReactNode
}) => {
  return (
    <VerticallyOffCenter>
      <Div margin="auto" width={width} maxWidth="100%">
        {children}
      </Div>
    </VerticallyOffCenter>
  )
}
