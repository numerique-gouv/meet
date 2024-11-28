export type ApiRoom = {
  id: string
  name: string
  slug: string
  is_public: boolean
  is_administrable: boolean
  livekit?: {
    url: string
    room: string
    token: string
  }
  configuration?: {
    [key: string]: string | number | boolean
  }
}
