import { slugify } from './slugify'

export const createRandomRoom = () => {
  return slugify(crypto.randomUUID())
}
