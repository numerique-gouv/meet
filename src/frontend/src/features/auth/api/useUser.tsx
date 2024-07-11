import { useQuery } from '@tanstack/react-query'
import { keys } from '@/api/queryKeys'
import { fetchUser } from './fetchUser'

export const useUser = () => {
  const query = useQuery({
    queryKey: [keys.user],
    queryFn: fetchUser,
  })

  return {
    ...query,
    // if fetchUser returns false, it means the user is not logged in: expose that
    user: query.data === false ? undefined : query.data,
    isLoggedIn: query.data !== undefined && query.data !== false,
  }
}
