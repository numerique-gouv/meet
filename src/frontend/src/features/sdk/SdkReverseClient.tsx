export enum ClientMessageType {
  ROOM_CREATED = 'ROOM_CREATED',
}

export class SdkReverseClient {
  /**
   * TODO: Use API Key. Must be based on some sort of credentials ?
   */
  static getAllowTargetOrigin() {
    return '*'
  }

  static post(type: ClientMessageType, data: unknown = {}) {
    console.log('POST !', type, data, window.parent)
    // TODO: Make sure to use the correct origin.
    window.parent.postMessage(
      {
        type,
        data,
      },
      SdkReverseClient.getAllowTargetOrigin()
    )
    // TODO: Maybe use this to enforce security.
  }

  static broadcastAuthentication() {
    const bc = new BroadcastChannel('APP_CHANNEL')
    bc.postMessage({ type: 'AUTHENTICATED' })

    /**
     * This means the parent window has authenticated has successfully refetched user, then we can close the popup.
     */
    bc.onmessage = (event) => {
      if (event.data.type === 'AUTHENTICATED_ACK') {
        window.close()
      }
    }
  }

  static waitForAuthenticationAck() {
    return new Promise<void>((resolve) => {
      const bc = new BroadcastChannel('APP_CHANNEL')
      bc.onmessage = async (event) => {
        if (event.data.type === 'AUTHENTICATED') {
          resolve()
          bc.postMessage({ type: 'AUTHENTICATED_ACK' })
        }
      }
    })
  }

  static ensureAuth() {
    // TODO: ...
  }
}
