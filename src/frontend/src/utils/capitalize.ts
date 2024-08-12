export function capitalize(string: string) {
  if (!string) {
    return string
  }
  const trimmed = string.trim()
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
