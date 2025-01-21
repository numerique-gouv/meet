/**
 * Pattern for system-generated room IDs
 * Format: xxx-xxxx-xxx (e.g., abc-defg-hij)
 * This pattern is used when rooms are automatically created by the system,
 * ensuring consistent and predictable room IDs for randomly generated rooms.
 */
export const generatedRoomPattern = '[a-z]{3}-[a-z]{4}-[a-z]{3}'

/**
 * Pattern for user-defined custom room IDs
 * Format: Minimum 5 lowercase alphanumeric characters
 * This pattern allows users to create memorable, personalized room names
 * while maintaining basic validation rules (e.g., myroom123, teamspace, project2024)
 */
export const personalizedRoomPattern = '[a-z0-9]{5,}'

// Combined pattern that accepts both system-generated and personalized room IDs
// This allows flexibility in room creation while maintaining consistent validation
export const roomIdPattern = `(?:${generatedRoomPattern}|${personalizedRoomPattern})`

export const isRoomValid = (roomIdOrUrl: string) =>
  new RegExp(`^${roomIdPattern}$`).test(roomIdOrUrl) ||
  new RegExp(`^${window.location.origin}/${roomIdPattern}$`).test(roomIdOrUrl)
