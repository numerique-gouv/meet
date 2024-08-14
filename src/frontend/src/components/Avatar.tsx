import { css } from '@/styled-system/css'
import React from 'react'

export type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  name: string
  size?: number
  bgColor?: string
  textColor?: string
}

export const Avatar = ({
  name,
  size = 32,
  bgColor = '#3498db',
  textColor = 'white',
}: AvatarProps) => {
  const initial = name?.trim()?.charAt(0).toUpperCase() || '*' // fixme use a proper fallback
  return (
    <div
      className={css({
        backgroundColor: bgColor,
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
      }}
    >
      {initial}
    </div>
  )
}
