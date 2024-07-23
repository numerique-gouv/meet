const roomIdPattern = '[a-z]{3}-[a-z]{4}-[a-z]{3}'
export const roomRouteRegex = new RegExp(`^[/](?<roomId>${roomIdPattern})$`)

export const isRoomValid = (roomId: string) =>
  new RegExp(`^${roomIdPattern}$`).test(roomId)
