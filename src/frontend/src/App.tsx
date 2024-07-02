import '@livekit/components-styles'
import '@/styles/index.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Home } from './routes/Home'
import { Conference } from './routes/Conference'
import { NotFoundScreen } from './layout/NotFoundScreen'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/:roomId" component={Conference} />
        <Route component={NotFoundScreen} />
      </Switch>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
