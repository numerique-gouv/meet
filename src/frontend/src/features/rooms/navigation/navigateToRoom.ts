import { navigate } from 'wouter/use-browser-location'

export const navigateToRoom = (roomId: string) => {
  navigate(`/${roomId}`)
}
