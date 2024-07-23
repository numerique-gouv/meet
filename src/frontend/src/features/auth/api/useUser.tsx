import { useQuery } from '@tanstack/react-query'
import { keys } from '@/api/queryKeys'
import { fetchUser } from './fetchUser'

/**
 * returns info about currently logged in user
 *
 * `isLoggedIn` is undefined while query is loading and true/false when it's done
 */
export const useUser = () => {
  const query = useQuery({
    queryKey: [keys.user],
    queryFn: fetchUser,
  })

  let isLoggedIn = undefined
  if (query.data !== undefined) {
    isLoggedIn = query.data !== false
  }
  return {
    ...query,
    // if fetchUser returns false, it means the user is not logged in: expose that
    user: query.data === false ? undefined : query.data,
    isLoggedIn,
  }
}
