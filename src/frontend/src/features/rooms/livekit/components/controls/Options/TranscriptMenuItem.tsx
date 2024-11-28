import { RiRecordCircleLine, RiStopCircleLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { menuRecipe } from '@/primitives/menuRecipe'
import { MenuItem } from 'react-aria-components'
import {
  RecordingMode,
  useStartRecording,
} from '@/features/rooms/api/startRecording'
import { useStopRecording } from '@/features/rooms/api/stopRecording'
import { useRoomContext } from '@livekit/components-react'
import { useRoomData } from '@/features/rooms/livekit/hooks/useRoomData'
import { useConfig } from '@/api/useConfig'

export const TranscriptMenuItem = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'options.items' })

  const data = useRoomData()

  const { mutateAsync: startRecordingRoom } = useStartRecording()
  const { mutateAsync: stopRecordingRoom } = useStopRecording()

  const { data: apiConfig } = useConfig()

  const room = useRoomContext()

  const handleTranscript = async () => {
    const roomId = data?.livekit?.room

    if (!roomId) {
      console.warn('No room ID found')
      return
    }

    try {
      if (room.isRecording) {
        await stopRecordingRoom({ id: roomId })
      } else {
        await startRecordingRoom({ id: roomId, mode: RecordingMode.Transcript })
      }
    } catch (error) {
      console.error('Failed to handle transcript:', error)
    }
  }

  if (
    !apiConfig.recording?.is_enabled ||
    !apiConfig.recording?.available_modes?.includes(RecordingMode.Transcript)
  ) {
    return
  }

  return (
    <MenuItem
      className={menuRecipe({ icon: true }).item}
      onAction={async () => await handleTranscript()}
    >
      {room.isRecording ? (
        <>
          <RiRecordCircleLine size={20} />
          {t('transcript.stop')}
        </>
      ) : (
        <>
          <RiStopCircleLine size={20} />
          {t('transcript.start')}
        </>
      )}
    </MenuItem>
  )
}
