import type { ReactNode } from 'react'
import { css } from '@/styled-system/css'
import { Header } from './Header'

export const Screen = ({
  type,
  children,
}: {
  type?: 'splash'
  children?: ReactNode
}) => {
  return (
    <div
      className={css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: type === 'splash' ? 'white' : 'default.bg',
        color: 'default.text',
      })}
    >
      {type !== 'splash' && <Header />}
      <main
        className={css({
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        {children}
      </main>
    </div>
  )
}
