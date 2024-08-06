import { proxy, subscribe } from 'valtio'
import { devtools } from 'valtio/utils'

export type SettingsState = {
  username: string | undefined
  devices: {
    /**
     * MediaDeviceInfo id
     */
    micDeviceId: string | undefined
    /**
     * MediaDeviceInfo id
     */
    cameraDeviceId: string | undefined
    enableMic: boolean
    enableCamera: boolean
  }
}

// sync the valtio store with localstorage data
// @TODO: make it easier to have "persisted" stores as we will definitely use it quite often

const localData = localStorage.getItem('meet.settings')

export const settingsStore = proxy<SettingsState>(
  localData
    ? JSON.parse(localData)
    : {
        username: undefined,
        devices: {
          micDeviceId: undefined,
          cameraDeviceId: undefined,
          enableMic: false,
          enableCamera: false,
        },
      }
)

subscribe(settingsStore, () => {
  localStorage.setItem('meet.settings', JSON.stringify(settingsStore))
})

if (import.meta.env.DEV) {
  devtools(settingsStore, { name: 'settings', enabled: true })
}
