import type { ApiUser } from './ApiUser'
import { fetchApi } from './fetchApi'

export const fetchUser = () => {
  return fetchApi<ApiUser>('/users/me')
}
