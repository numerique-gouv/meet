import { useRoomContext } from '@livekit/components-react'
import { useEffect, useState } from 'react'
import { RoomEvent } from 'livekit-client'
import { egressStore } from '@/stores/egress.tsx'
import { useSnapshot } from 'valtio'

export const RecordingIndicator = () => {
  const room = useRoomContext()
  const [isRecording, setIsRecording] = useState(room.isRecording)

  const egressSnap = useSnapshot(egressStore)
  const egressIsStopping = egressSnap.egressIsStopping

  useEffect(() => {
    const handleRecordingStatusChanges = (isRecording: boolean) => {
      if (!isRecording) {
        egressStore.egressIsStopping = false
      }

      setIsRecording(isRecording)
    }
    room.on(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanges)
    return () => {
      room.off(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanges)
    }
  }, [room])

  const getStatus = () => {
    if (egressIsStopping) {
      return 'saving recording'
    }
    if (isRecording) {
      return 'recording'
    }
    if (!isRecording) {
      return 'available'
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      Room status: {getStatus()}
    </div>
  )
}
