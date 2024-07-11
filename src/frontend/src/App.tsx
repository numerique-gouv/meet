import '@livekit/components-styles'
import '@/styles/index.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Home } from './routes/Home'
import { NotFound } from './routes/NotFound'
import { RoomRoute } from '@/features/rooms'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/:roomId" component={RoomRoute} />
        <Route component={NotFound} />
      </Switch>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
