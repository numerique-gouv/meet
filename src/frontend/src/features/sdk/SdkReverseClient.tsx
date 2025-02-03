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
}
