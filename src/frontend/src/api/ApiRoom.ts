export type ApiRoom = {
  id: string
  name: string
  slug: string
  is_public: boolean
  livekit?: {
    room: string
    token: string
  }
}
