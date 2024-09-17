import '@livekit/components-styles'
import '@/styles/index.css'
import { Suspense } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLang } from 'hoofd'
import { Switch, Route } from 'wouter'
import { I18nProvider } from 'react-aria-components'
import { Layout } from './layout/Layout'
import { NotFoundScreen } from './components/NotFoundScreen'
import { routes } from './routes'
import './i18n/init'
import { silenceLiveKitLogs } from '@/utils/livekit.ts'
import { queryClient } from '@/api/queryClient'
import posthog from 'posthog-js'

function App() {
  const { i18n } = useTranslation()
  useLang(i18n.language)

  posthog.init('phc_RPYko028Oqtj0c9exLIWwrlrjLxSdxT0ntW0Lam4iom', {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'always',
  })

  const isProduction = import.meta.env.PROD
  silenceLiveKitLogs(isProduction)

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <I18nProvider locale={i18n.language}>
          <Layout>
            <Switch>
              {Object.entries(routes).map(([, route], i) => (
                <Route key={i} path={route.path} component={route.Component} />
              ))}
              <Route component={NotFoundScreen} />
            </Switch>
          </Layout>
          <ReactQueryDevtools initialIsOpen={false} />
        </I18nProvider>
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
