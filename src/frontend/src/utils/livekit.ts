import { LogLevel, setLogLevel } from 'livekit-client'

export const silenceLiveKitLogs = (shouldSilenceLogs: boolean) => {
  setLogLevel(shouldSilenceLogs ? LogLevel.silent : LogLevel.debug)
}
