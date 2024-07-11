import { slugify } from '@/utils/slugify'

export const generateRoomId = () => {
  return slugify(crypto.randomUUID())
}
