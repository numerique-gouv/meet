import { FeedbackRoute, RoomRoute, roomIdPattern } from '@/features/rooms'
import { HomeRoute } from '@/features/home'

export const routes: Record<
  'home' | 'room' | 'feedback' | 'sdkCreateButton',
  {
    name: RouteName
    path: RegExp | string
    Component: () => JSX.Element
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    to?: (...args: any[]) => string | URL
  }
> = {
  home: {
    name: 'home',
    path: '/',
    Component: HomeRoute,
  },
  room: {
    name: 'room',
    path: new RegExp(`^[/](?<roomId>${roomIdPattern})$`),
    to: (roomId: string) => `/${roomId.trim()}`,
    Component: RoomRoute,
  },
  feedback: {
    name: 'feedback',
    path: '/feedback',
    Component: FeedbackRoute,
  },
}

export type RouteName = keyof typeof routes
