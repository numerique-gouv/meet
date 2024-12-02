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
  footer?: boolean
  children: React.ReactNode
}

export const Screen = ({
  layout = 'fullpage',
  header = true,
  footer = true,
  children,
}: ScreenProps) => {
  useEffect(() => {
    if (header !== undefined) {
      layoutStore.showHeader = header
    }
    if (footer !== undefined) {
      layoutStore.showFooter = footer
    }
  }, [header, footer])
  return layout === 'centered' ? <Centered>{children}</Centered> : children
}
