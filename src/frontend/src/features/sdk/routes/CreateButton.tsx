import { Button } from '@/primitives/Button'
import { useTranslation } from 'react-i18next'
import { usePersistentUserChoices } from '@livekit/components-react'
import { useState } from 'react'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { css } from '@/styled-system/css'
import { RiCheckLine, RiFileCopyLine } from '@remixicon/react'
import { VisioIcon } from '@/assets/VisioIcon'
import { generateRoomId, useCreateRoom } from '../../rooms'
import { ClientMessageType, SdkReverseClient } from '../SdkReverseClient'

export const SdkCreateButton = () => {
  const { t } = useTranslation('sdk', { keyPrefix: 'createButton' })
  const { t: th } = useTranslation('home')
  const [roomUrl, setRoomUrl] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const {
    userChoices: { username },
  } = usePersistentUserChoices()

  const { mutateAsync: createRoom } = useCreateRoom()

  const submit = () => {
    console.log('SUBMIT')
    setIsLoading(true)
    setTimeout(() => {
      const slug = generateRoomId()
      createRoom({ slug, username }).then((data) => {
        const roomUrlTmp = getRouteUrl('room', data.slug)
        setRoomUrl(roomUrlTmp)
        setIsLoading(false)
        SdkReverseClient.post(ClientMessageType.ROOM_CREATED, {
          url: roomUrlTmp,
        })
      })
    }, 0)
  }

  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(roomUrl!)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <div
      className={css({
        paddingTop: '3px',
        paddingLeft: '3px',
      })}
    >
      {roomUrl ? (
        <Button
          variant={isCopied ? 'success' : 'quaternary'}
          onHoverChange={setIsHovered}
          data-attr="sdk-create-copy"
          onPress={copy}
          className={css({
            ...(isCopied
              ? {}
              : {
                  paddingLeft: 0,
                }),
          })}
          icon={
            isCopied ? (
              <RiCheckLine size={18} style={{ marginRight: '8px' }} />
            ) : (
              <RiFileCopyLine size={24} />
            )
          }
        >
          {isCopied ? (
            th('laterMeetingDialog.copied')
          ) : (
            <>
              {isHovered ? th('laterMeetingDialog.copy') : <div>{roomUrl}</div>}
            </>
          )}
        </Button>
      ) : (
        <Button
          variant="primaryDark"
          aria-label={t('label')}
          onPress={submit}
          data-attr="sdk-create"
          loading={isLoading}
          icon={<VisioIcon />}
        >
          {t('label')}
        </Button>
      )}
    </div>
  )
}
