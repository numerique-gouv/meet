export const buildServerApiUrl = (origin: string, path: string) => {
  const sanitizedOrigin = origin.replace(/\/$/, '')
  const sanitizedPath = path.replace(/^\//, '')
  return `${sanitizedOrigin}/${sanitizedPath}`
}
