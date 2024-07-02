import type { ReactNode } from 'react'
import { css } from '@/styled-system/css'
import { Header } from '@/layout/Header'

export const Screen = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={css({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'slate.50',
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
