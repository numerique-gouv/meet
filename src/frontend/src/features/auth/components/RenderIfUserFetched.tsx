import { type ReactNode } from 'react'
import { useUser } from '@/features/auth'
import { LoadingScreen } from '@/layout/LoadingScreen'

/**
 * wrapper that renders children only when user info has been actually fetched
 *
 * this is helpful to prevent flash of logged-out content for a few milliseconds when user is actually logged in
 */
export const RenderIfUserFetched = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useUser()
  return isLoggedIn !== undefined ? (
    children
  ) : (
    <LoadingScreen renderTimeout={1000} />
  )
}
