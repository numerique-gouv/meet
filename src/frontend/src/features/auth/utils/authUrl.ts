import { apiUrl } from '@/api/apiUrl'

export const authUrl = (isSilentLogin = false) => {
  const currentUrl = window.location.href;
  return apiUrl(`/authenticate?silent=${encodeURIComponent(isSilentLogin)}&&returnTo=${encodeURIComponent(currentUrl)}`)
}

export const logoutUrl = () => {
  return apiUrl('/logout')
}
