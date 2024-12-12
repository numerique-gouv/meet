import { isMobileBrowser } from '@livekit/components-core'
import { useEffect, useState } from 'react'

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(isMobileBrowser())

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileBrowser())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return isMobile
}
