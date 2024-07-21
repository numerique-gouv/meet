import { type ReactNode } from 'react'
import { Div } from './Div'

/**
 * Renders children almost vertically centered (a bit closer to the top).
 *
 * This is useful because most of the time we want "vertically centered" things,
 * we actually want them to be a bit closer to the top,
 * as a perfectly centered box of content really looks off
 */
export const VerticallyOffCenter = ({ children }: { children: ReactNode }) => {
  return (
    <Div display="flex" flexDirection="column" width="full" height="full">
      {/* make sure we can't click on those empty layout-specific divs,
      to prevent click issues for example on dialog modal overlays */}
      <Div flex="1 1 35%" pointerEvents="none" />
      <Div width="full" flex="1 1 100%">
        {children}
      </Div>
      <Div flex="1 1 65%" pointerEvents="none" />
    </Div>
  )
}
