import type { ReactNode } from 'react'
import { css } from '@/styled-system/css'
import { Header } from './Header'

export const Screen = ({ children }: { children?: ReactNode }) => {
  return (
    <div
      className={css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'default.bg',
        color: 'default.text',
      })}
    >
      <Header />
      <main
        className={css({
          flexGrow: 1,
          overflow: 'auto',
        })}
      >
        {children}
      </main>
    </div>
  )
}
