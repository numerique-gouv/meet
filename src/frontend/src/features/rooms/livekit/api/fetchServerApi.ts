import { ApiError } from '@/api/ApiError'

export const fetchServerApi = async <T = Record<string, unknown>>(
  url: string,
  token: string,
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  })
  const result = await response.json()
  if (!response.ok) {
    throw new ApiError(response.status, result)
  }
  return result
}
