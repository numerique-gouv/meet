export const roomIdPattern = '[a-z]{3}-[a-z]{4}-[a-z]{3}'

export const isRoomValid = (roomIdOrUrl: string) =>
  new RegExp(`^${roomIdPattern}$`).test(roomIdOrUrl) ||
  new RegExp(`^${window.location.origin}/${roomIdPattern}$`).test(roomIdOrUrl)
