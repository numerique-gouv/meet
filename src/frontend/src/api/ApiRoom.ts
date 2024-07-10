export type ApiRoom = {
  id: string
  name: string
  slug: string
  is_public: boolean
  livekit?: {
    url: string
    room: string
    token: string
  }
}
