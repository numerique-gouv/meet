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
import { queryClient } from '@/api/queryClient'
import { AppInitialization } from '@/components/AppInitialization'
import { SdkCreateButton } from './features/rooms/routes/sdk/CreateButton'

function App() {
  const { i18n } = useTranslation()
  useLang(i18n.language)
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <I18nProvider locale={i18n.language}>
          <Switch>
            {/* We only want support and ReactQueryDevTools in non /sdk routes */}
            <Route path={/^(?!\/sdk).*$/}>
              <AppInitialization />
              <Layout>
                {Object.entries(routes).map(([, route], i) => (
                  <Route
                    key={i}
                    path={route.path}
                    component={route.Component}
                  />
                ))}
              </Layout>
              <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="top-left"
              />
            </Route>
            <Route path="/sdk" nest>
              <Route path="/create-button">
                <SdkCreateButton />
              </Route>
            </Route>
            <Route component={NotFoundScreen} />
          </Switch>
        </I18nProvider>
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
