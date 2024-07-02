import type { HTMLAttributes } from 'react'
import classNames from 'classnames'
import { css } from '@/styled-system/css'

export const H1 = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1
      className={classNames(
        css({
          textStyle: '2xl',
          marginBottom: '1',
        }),
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
}
