import { useEffect } from 'react'
import { Crisp } from 'crisp-sdk-web'
import { ApiUser } from '@/features/auth/api/ApiUser'

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

export type useSupportProps = {
  id?: string
}

// Configure Crisp chat for real-time support across all pages.
export const useSupport = ({ id }: useSupportProps) => {
  useEffect(() => {
    if (!id || Crisp.isCrispInjected()) return
    Crisp.configure(id)
    Crisp.setHideOnMobile(true)
  }, [id])

  return null
}
