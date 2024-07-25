import { useRoute } from 'wouter'
import { type RouteName, routes } from '../routes'

export const useMatchesRoute = (route: RouteName) => {
  const [match] = useRoute(routes[route].path)
  return match
}
