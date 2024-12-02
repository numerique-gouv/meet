import { ErrorScreen } from '@/components/ErrorScreen'
import { LoadingScreen } from '@/components/LoadingScreen'

/**
 * Render an error or loading Screen while a given `status` is not a success,
 * otherwise directly render children.
 *
 * `status` matches react query statuses.
 *
 * Children usually contain a Screen at some point in the render tree.
 */
export const QueryAware = ({
  status,
  children,
}: {
  status: 'error' | 'idle' | 'pending' | 'success'
  children: React.ReactNode
}) => {
  if (status === 'error') {
    return <ErrorScreen />
  }

  if (status === 'pending') {
    return <LoadingScreen header={undefined} footer={undefined} />
  }

  return children
}
