import { ErrorScreen } from './ErrorScreen'
import { LoadingScreen } from './LoadingScreen'
import { Screen } from './Screen'

export const QueryAware = ({
  status,
  children,
}: {
  status: 'error' | 'pending' | 'success'
  children: React.ReactNode
}) => {
  if (status === 'error') {
    return <ErrorScreen />
  }

  if (status === 'pending') {
    return <LoadingScreen />
  }

  return <Screen>{children}</Screen>
}
