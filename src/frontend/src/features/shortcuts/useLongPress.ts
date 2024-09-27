import { useEffect, useRef } from 'react'

export type useLongPressProps = {
  keyCode?: string
  onKeyDown: () => void
  onKeyUp: () => void
  longPressThreshold?: number
}

export const useLongPress = ({
  keyCode,
  onKeyDown,
  onKeyUp,
  longPressThreshold = 300,
}: useLongPressProps) => {
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code != keyCode || timeoutIdRef.current) return
      timeoutIdRef.current = setTimeout(() => {
        onKeyDown()
      }, longPressThreshold)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code != keyCode || !timeoutIdRef.current) return
      clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
      onKeyUp()
    }

    if (!keyCode) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [keyCode, onKeyDown, onKeyUp, longPressThreshold])

  return
}

export default useLongPress
