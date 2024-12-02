import { type ReactNode } from 'react'
import { css } from '@/styled-system/css'
import { Header } from './Header'
import { layoutStore } from '@/stores/layout'
import { useSnapshot } from 'valtio'
import { Footer } from '@/layout/Footer'

export type Layout = 'fullpage' | 'centered'

/**
 * Layout component for the app.
 *
 * This component is meant to be used as a wrapper around the whole app.
 * In a specific page, use the `Screen` component and change its props to change global page layout.
 */
export const Layout = ({ children }: { children: ReactNode }) => {
  const layoutSnap = useSnapshot(layoutStore)
  const showHeader = layoutSnap.showHeader
  const showFooter = layoutSnap.showFooter

  return (
    <>
      <div
        className={css({
          height: '100%',
          display: 'flex',
          minHeight: 'fit-content',
          flexDirection: 'column',
          backgroundColor: 'white',
          color: 'default.text',
        })}
      >
        {showHeader && <Header />}
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
      {showFooter && <Footer />}
    </>
  )
}
