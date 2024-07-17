import { apiUrl } from '@/api/apiUrl'

export const logoutUrl = () => {
  return apiUrl('/logout')
}
