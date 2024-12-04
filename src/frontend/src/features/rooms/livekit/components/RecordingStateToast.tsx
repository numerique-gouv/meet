import { css } from '@/styled-system/css'
import { RiRecordCircleLine } from '@remixicon/react'
import { Text } from '@/primitives'
import { useTranslation } from 'react-i18next'
import { useRoomContext } from '@livekit/components-react'

export const RecordingStateToast = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'recording' })

  const room = useRoomContext()

  if (!room?.isRecording) return

  return (
    <div
      className={css({
        display: 'flex',
        position: 'fixed',
        top: '10px',
        left: '10px',
        paddingY: '0.25rem',
        paddingX: '0.25rem 0.35rem',
        backgroundColor: 'primaryDark.200',
        borderColor: 'primaryDark.400',
        border: '1px solid',
        color: 'white',
        borderRadius: '4px',
        gap: '0.5rem',
      })}
    >
      <RiRecordCircleLine
        size={20}
        className={css({
          color: 'white',
          backgroundColor: 'danger.700',
          padding: '3px',
          borderRadius: '3px',
        })}
      />
      <Text variant={'sm'}>{t('label')}</Text>
    </div>
  )
}
