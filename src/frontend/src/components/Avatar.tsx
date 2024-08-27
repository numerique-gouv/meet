import { cva, RecipeVariantProps } from '@/styled-system/css'
import React from 'react'

const avatar = cva({
  base: {
    backgroundColor: 'transparent',
    color: 'white',
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    cursor: 'default',
    flexGrow: 0,
    flexShrink: 0,
  },
  variants: {
    context: {
      list: {
        width: '32px',
        height: '32px',
        fontSize: '0.8rem',
      },
      placeholder: {
        width: '100%',
        height: '100%',
      },
    },
  },
  defaultVariants: {
    context: 'list',
  },
})

export type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  name?: string
  bgColor?: string
} & RecipeVariantProps<typeof avatar>

export const Avatar = ({ name, bgColor, context, ...props }: AvatarProps) => {
  const initial = name?.trim()?.charAt(0) || ''
  return (
    <div
      style={{
        backgroundColor: bgColor,
      }}
      className={avatar({ context })}
      {...props}
    >
      {initial}
    </div>
  )
}
