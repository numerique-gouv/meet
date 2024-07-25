export const roomIdPattern = '[a-z]{3}-[a-z]{4}-[a-z]{3}'

export const isRoomValid = (roomId: string) =>
  new RegExp(`^${roomIdPattern}$`).test(roomId)
