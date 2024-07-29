import { layoutStore } from '@/stores/layout'
import { Layout } from './Layout'
import { useEffect } from 'react'
import { Centered } from './Centered'

export type ScreenProps = {
  /**
   * 'fullpage' by default.
   */
  layout?: Layout
  /**
   * Show header or not.
   * True by default. Pass undefined to render the screen without modifying current header visibility
   */
  header?: boolean
  children: React.ReactNode
}

export const Screen = ({
  layout = 'fullpage',
  header = true,
  children,
}: ScreenProps) => {
  useEffect(() => {
    if (header !== undefined) {
      layoutStore.showHeader = header
    }
  }, [header])
  return layout === 'centered' ? <Centered>{children}</Centered> : children
}
