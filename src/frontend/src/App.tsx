import '@livekit/components-styles'
import '@/styles/index.css'
import { Suspense } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLang } from 'hoofd'
import { Switch, Route } from 'wouter'
import { NotFoundScreen } from './layout/NotFoundScreen'
import { RenderIfUserFetched } from './features/auth'
import { routes } from './routes'
import './i18n/init'

const queryClient = new QueryClient()

function App() {
  const { i18n } = useTranslation()
  useLang(i18n.language)
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <RenderIfUserFetched>
          <Switch>
            {Object.entries(routes).map(([, route], i) => (
              <Route key={i} path={route.path} component={route.Component} />
            ))}
            <Route component={NotFoundScreen} />
          </Switch>
        </RenderIfUserFetched>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
