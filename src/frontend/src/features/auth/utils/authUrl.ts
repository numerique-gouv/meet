import { apiUrl } from '@/api/apiUrl'

export const authUrl = () => {
  return apiUrl('/authenticate')
}

export const logoutUrl = () => {
  return apiUrl('/logout')
}
