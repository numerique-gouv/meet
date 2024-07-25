import { useRoute } from 'wouter'
import { roomRouteRegex } from '@/features/rooms'

type RouteName = 'home' | 'room'

const routeMap = {
  home: '/',
  room: roomRouteRegex,
}

export const useMatchesRoute = (route: RouteName) => {
  const [match] = useRoute(routeMap[route])
  if (!(route in routeMap)) {
    throw new Error(`Route ${route} not found`)
  }
  return match
}
