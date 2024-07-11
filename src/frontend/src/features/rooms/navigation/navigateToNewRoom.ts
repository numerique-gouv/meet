import { navigate } from 'wouter/use-browser-location'
import { generateRoomId } from '../utils/generateRoomId'

export const navigateToNewRoom = () => {
  navigate(`/${generateRoomId()}`)
}
