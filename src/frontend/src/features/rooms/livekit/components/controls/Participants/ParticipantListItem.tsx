import { css } from '@/styled-system/css'

import { HStack } from '@/styled-system/jsx'
import { Text } from '@/primitives/Text'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@/components/Avatar'
import { getParticipantColor } from '@/features/rooms/utils/getParticipantColor'
import { Participant, Track } from 'livekit-client'
import { isLocal } from '@/utils/livekit'
import {
  useIsSpeaking,
  useTrackMutedIndicator,
} from '@livekit/components-react'
import Source = Track.Source
import { RiMicFill, RiMicOffFill } from '@remixicon/react'
import { Button, Dialog, P } from '@/primitives'
import { useState } from 'react'
import { useMuteParticipant } from '@/features/rooms/livekit/api/muteParticipant'

const MuteAlertDialog = ({
  isOpen,
  onClose,
  onSubmit,
  name,
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  name: string
}) => {
  const { t } = useTranslation('rooms')
  return (
    <Dialog isOpen={isOpen} role="alertdialog">
      <P>{t('participants.muteParticipantAlert.description', { name })}</P>
      <HStack gap={1}>
        <Button variant="text" size="sm" onPress={onClose}>
          {t('participants.muteParticipantAlert.cancel')}
        </Button>
        <Button variant="text" size="sm" onPress={onSubmit}>
          {t('participants.muteParticipantAlert.confirm')}
        </Button>
      </HStack>
    </Dialog>
  )
}

type MicIndicatorProps = {
  participant: Participant
}

const MicIndicator = ({ participant }: MicIndicatorProps) => {
  const { t } = useTranslation('rooms')
  const { muteParticipant } = useMuteParticipant()
  const { isMuted } = useTrackMutedIndicator({
    participant: participant,
    source: Source.Microphone,
  })
  const isSpeaking = useIsSpeaking(participant)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const name = participant.name || participant.identity

  return (
    <>
      <Button
        square
        invisible
        size="sm"
        tooltip={
          isLocal(participant)
            ? t('participants.muteYourself')
            : t('participants.muteParticipant', {
                name,
              })
        }
        isDisabled={isMuted}
        onPress={() =>
          !isMuted && isLocal(participant)
            ? muteParticipant(participant)
            : setIsAlertOpen(true)
        }
      >
        {isMuted ? (
          <RiMicOffFill color={'gray'} />
        ) : (
          <RiMicFill
            style={{
              animation: isSpeaking ? 'pulse_mic 800ms infinite' : undefined,
            }}
          />
        )}
      </Button>
      <MuteAlertDialog
        isOpen={isAlertOpen}
        onSubmit={() =>
          muteParticipant(participant).then(() => setIsAlertOpen(false))
        }
        onClose={() => setIsAlertOpen(false)}
        name={name}
      />
    </>
  )
}

type ParticipantListItemProps = {
  participant: Participant
}

export const ParticipantListItem = ({
  participant,
}: ParticipantListItemProps) => {
  const { t } = useTranslation('rooms')
  const name = participant.name || participant.identity
  return (
    <HStack
      role="listitem"
      justify="space-between"
      key={participant.identity}
      id={participant.identity}
      className={css({
        padding: '0.25rem 0',
        width: 'full',
      })}
    >
      <HStack>
        <Avatar name={name} bgColor={getParticipantColor(participant)} />
        <Text
          variant={'sm'}
          className={css({
            userSelect: 'none',
            cursor: 'default',
            display: 'flex',
          })}
        >
          <span
            className={css({
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '120px',
              display: 'block',
            })}
          >
            {name}
          </span>
          {isLocal(participant) && (
            <span
              className={css({
                marginLeft: '.25rem',
                whiteSpace: 'nowrap',
              })}
            >
              ({t('participants.you')})
            </span>
          )}
        </Text>
      </HStack>
      <HStack>
        <MicIndicator participant={participant} />
      </HStack>
    </HStack>
  )
}
