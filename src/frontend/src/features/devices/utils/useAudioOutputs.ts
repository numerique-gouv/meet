import { useState, useEffect } from 'react'

const getOutputDevices = () => {
  return navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(() => navigator.mediaDevices.enumerateDevices())
    .then((devices) => devices.filter(({ kind }) => kind === 'audiooutput'))
}

/**
 * custom hook to fetch audio outputs
 *
 * this is used instead of livekit's useMediaDevices because the livekit integrated one seems to request
 * outputs in a weird order, resulting in empty results in firefox if we didn't ask for input before
 */
export const useAudioOutputs = () => {
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([])
  useEffect(() => {
    const retrieveOutputDevices = () => {
      getOutputDevices()
        .then(setAudioOutputs)
        .catch((error) => {
          console.error('Audio outputs retrieval error :', error)
        })
    }
    retrieveOutputDevices()
    const onDeviceChange = () => {
      retrieveOutputDevices()
    }
    navigator?.mediaDevices?.addEventListener('devicechange', onDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange)
    }
  }, [])
  return audioOutputs
}
