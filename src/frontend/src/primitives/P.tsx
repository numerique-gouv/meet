import type { HTMLAttributes } from 'react'
import classNames from 'classnames'
import { css } from '@/styled-system/css'

export const P = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={classNames(
        css({
          marginBottom: '1',
        }),
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
