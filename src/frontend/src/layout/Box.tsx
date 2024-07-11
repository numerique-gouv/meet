import type { ReactNode } from 'react'
import { Box as BoxDiv, H, Link } from '@/primitives'

export type BoxProps = {
  children?: ReactNode
  title?: ReactNode
  withBackButton?: boolean
}

export const Box = ({
  children,
  title = '',
  withBackButton = false,
}: BoxProps) => {
  return (
    <BoxDiv asScreen>
      {!!title && <H lvl={1}>{title}</H>}
      {children}
      {!!withBackButton && (
        <p>
          <Link to="/" size="small">
            Back to homescreen
          </Link>
        </p>
      )}
    </BoxDiv>
  )
}
