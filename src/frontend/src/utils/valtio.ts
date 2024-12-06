import { proxyMap } from 'valtio/utils'

/**
 * Serializes Map objects into a JSON-friendly format while preserving valtio proxyMap compatibility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeProxyMap(_: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    }
  }
  return value
}

/**
 * Custom JSON reviver function for deserializing Map objects and wrapping them in valtio proxyMap
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deserializeToProxyMap(_: string, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return proxyMap(new Map(value.value))
    }
  }
  return value
}
