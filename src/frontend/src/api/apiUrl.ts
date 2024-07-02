export const apiUrl = (path: string) => {
  return `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${path}`
}
