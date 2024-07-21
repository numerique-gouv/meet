import '@livekit/components-styles'
import '@/styles/index.css'
import { Suspense } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLang } from 'hoofd'
import { Route, Switch } from 'wouter'
import { Screen } from './layout/Screen'
import { HomeRoute } from '@/features/home'
import { RoomRoute, roomIdRegex } from '@/features/rooms'
import { NotFound } from './routes/NotFound'
import './i18n/init'

const queryClient = new QueryClient()

function App() {
  const { i18n } = useTranslation()
  useLang(i18n.language)
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Screen />}>
        <Switch>
          <Route path="/" component={HomeRoute} />
          <Route path={roomIdRegex} component={RoomRoute} />
          <Route component={NotFound} />
        </Switch>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
