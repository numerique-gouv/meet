import { useState, useEffect, type ReactNode } from 'react'

export const DelayedRender = ({
  children,
  delay = 500,
}: {
  delay?: number
  children: ReactNode
}) => {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (delay === 0) {
      setShow(true)
      return
    }
    const timeout = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])
  if (delay !== 0 && !show) {
    return null
  }

  return children
}
