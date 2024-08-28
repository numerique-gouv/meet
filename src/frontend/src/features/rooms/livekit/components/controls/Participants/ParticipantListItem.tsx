import { css } from '@/styled-system/css'

import { HStack } from '@/styled-system/jsx'
import { Text } from '@/primitives/Text'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@/components/Avatar'
import { getParticipantColor } from '@/features/rooms/utils/getParticipantColor'
import { Participant } from 'livekit-client'
import { isLocal } from '@/utils/livekit'

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
      key={participant.identity}
      id={participant.identity}
      className={css({
        padding: '0.25rem 0',
      })}
    >
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
  )
}
