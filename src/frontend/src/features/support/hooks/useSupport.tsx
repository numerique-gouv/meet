import { useEffect } from 'react'
import { Crisp } from 'crisp-sdk-web'
import { ApiUser } from '@/features/auth/api/ApiUser'

const SUPPORT_ID = '58ea6697-8eba-4492-bc59-ad6562585041'

export const initializeSupportSession = (user: ApiUser) => {
  if (!Crisp.isCrispInjected()) return
  const { id, email } = user
  Crisp.setTokenId(`meet-${id}`)
  Crisp.user.setEmail(email)
}

export const terminateSupportSession = () => {
  if (!Crisp.isCrispInjected()) return
  Crisp.setTokenId()
  Crisp.session.reset()
}

// Configure Crisp chat for real-time support across all pages.
export const useSupport = () => {
  useEffect(() => {
    if (!SUPPORT_ID) {
      console.warn('Crisp Website ID is not set')
      return
    }
    if (Crisp.isCrispInjected()) return
    Crisp.configure(SUPPORT_ID)
    Crisp.setHideOnMobile(true)
  }, [])

  return null
}
