import { getBrowser, LogLevel, setLogLevel } from 'livekit-client'

export const silenceLiveKitLogs = (shouldSilenceLogs: boolean) => {
  setLogLevel(shouldSilenceLogs ? LogLevel.silent : LogLevel.debug)
}

export function isFireFox(): boolean {
  return getBrowser()?.name === 'Firefox'
}

export function isChromiumBased(): boolean {
  return getBrowser()?.name === 'Chrome'
}

export function isSafari(): boolean {
  return getBrowser()?.name === 'Safari'
}
