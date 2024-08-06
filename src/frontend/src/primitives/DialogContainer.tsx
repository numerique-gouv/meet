import { ReactNode, useContext } from 'react'
import { OverlayTriggerStateContext } from 'react-aria-components'

/**
 * Small helper you can use as a wrapper of a <Dialog> component if you want to make sure it is not rendered when it is closed.
 *
 * Not required all the time, it's mostly helpful to avoid calling hooks of a child component that uses a Dialog.
 */
export const DialogContainer = ({ children }: { children: ReactNode }) => {
  const state = useContext(OverlayTriggerStateContext)!
  return state.isOpen ? children : null
}
