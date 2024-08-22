import { css } from '@/styled-system/css'
import React from 'react'

export type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  name?: string
  size?: number
  bgColor?: string
  textColor?: string
}

export const Avatar = ({
  name,
  size = 32,
  bgColor,
  textColor = 'white',
}: AvatarProps) => {
  const initial = name?.trim()?.charAt(0).toUpperCase() || ''
  return (
    <div
      className={css({
        backgroundColor: 'transparent',
        color: textColor,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
        cursor: 'default',
        flexGrow: 0,
        flexShrink: 0,
      })}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.4}px`,
        backgroundColor: bgColor,
      }}
    >
      {initial}
    </div>
  )
}
