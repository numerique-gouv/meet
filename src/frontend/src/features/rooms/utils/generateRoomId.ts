// Google Meet uses only letters in a room identifier
const ROOM_ID_ALLOWED_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz'

const getRandomChar = () =>
  ROOM_ID_ALLOWED_CHARACTERS[
    Math.floor(Math.random() * ROOM_ID_ALLOWED_CHARACTERS.length)
  ]

const generateSegment = (length: number): string =>
  Array.from(Array(length), getRandomChar).join('')

// Generates a unique room identifier following the Google Meet format
export const generateRoomId = () =>
  [generateSegment(3), generateSegment(4), generateSegment(3)].join('-')
