import { useQuery } from '@tanstack/react-query'
import { keys } from './keys'
import { fetchUser } from '@/api/fetchUser'

export const useUser = () => {
  const query = useQuery({
    queryKey: [keys.user],
    queryFn: fetchUser,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retryOnMount: false,
    retry: (_, error) => {
      return error.statusCode !== 401
    },
  })

  let isLoggedIn
  if (query.status === 'success' && query.data?.email !== null) {
    isLoggedIn = true
  }
  if (query.status === 'error' && query.failureReason?.statusCode === 401) {
    isLoggedIn = false
  }
  return {
    ...query,
    user: query.data,
    isLoggedIn,
  }
}
