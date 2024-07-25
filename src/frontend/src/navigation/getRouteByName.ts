import { type RouteName, routes } from '@/routes'

export const getRouteByName = (routeName: RouteName) => {
  const route = routes[routeName]
  if (!route) {
    throw new Error(`Route "${routeName}" does not exist`)
  }
  return route
}
