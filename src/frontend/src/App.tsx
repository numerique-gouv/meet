import '@livekit/components-styles'
import '@/styles/index.css'
import { Suspense } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLang } from 'hoofd'
import { Switch, Route } from 'wouter'
import { Layout } from './layout/Layout'
import { NotFoundScreen } from './components/NotFoundScreen'
import { routes } from './routes'
import './i18n/init'
import { silenceLiveKitLogs } from "@/utils/livekit.ts";

const queryClient = new QueryClient()

function App() {
  const { i18n } = useTranslation()
  useLang(i18n.language)

  const isProduction = import.meta.env.PROD
  silenceLiveKitLogs(isProduction)

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <Layout>
          <Switch>
            {Object.entries(routes).map(([, route], i) => (
              <Route key={i} path={route.path} component={route.Component} />
            ))}
            <Route component={NotFoundScreen} />
          </Switch>
        </Layout>
        <ReactQueryDevtools initialIsOpen={false} />
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
