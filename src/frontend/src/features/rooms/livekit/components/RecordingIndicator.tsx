import { useRoomContext } from '@livekit/components-react'
import { useEffect, useState } from 'react'
import { RoomEvent } from 'livekit-client'

export const RecordingIndicator = () => {
  const room = useRoomContext()
  const [isRecording, setIsRecording] = useState(room.isRecording)

  useEffect(() => {
    const handleRecordingStatusChanges = (isRecording: boolean) => {
      setIsRecording(isRecording)
    }
    room.on(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanges)
    return () => {
      room.off(RoomEvent.RecordingStatusChanged, handleRecordingStatusChanges)
    }
  }, [room])

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
      Room is recording: {isRecording ? 'yes' : 'no'}
    </div>
  )
}
