import { ApiError } from '../src/api/ApiError'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}
