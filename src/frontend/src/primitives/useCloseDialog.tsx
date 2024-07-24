import { useContext } from 'react'
import { OverlayTriggerStateContext } from 'react-aria-components'

export const useCloseDialog = () => {
  const dialogState = useContext(OverlayTriggerStateContext)
  if (dialogState) {
    return dialogState.close
  }
  return null
}
