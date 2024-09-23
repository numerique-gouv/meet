import { useQuery } from '@tanstack/react-query'
import { keys } from '@/api/queryKeys'
import { fetchUser } from './fetchUser'
import { type ApiUser } from './ApiUser'
import { useEffect } from 'react'
import { startAnalyticsSession } from '@/features/analytics/hooks/useAnalytics'

/**
 * returns info about currently logged-in user
 *
 * `isLoggedIn` is undefined while query is loading and true/false when it's done
 */
export const useUser = () => {
  const query = useQuery({
    queryKey: [keys.user],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  useEffect(() => {
    if (query?.data) {
      startAnalyticsSession(query.data)
    }
  }, [query.data])

  const isLoggedIn =
    query.status === 'success' ? query.data !== false : undefined
  const isLoggedOut = isLoggedIn === false

  return {
    ...query,
    user: isLoggedOut ? undefined : (query.data as ApiUser | undefined),
    isLoggedIn,
  }
}
