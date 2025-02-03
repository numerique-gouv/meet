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
import { authUrl, useUser } from '@/features/auth'

export const SdkCreateButton = () => {
  const { isLoggedIn, ...other } = useUser()
  const { t } = useTranslation('sdk', { keyPrefix: 'createButton' })
  const [roomUrl, setRoomUrl] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const {
    userChoices: { username },
  } = usePersistentUserChoices()

  const { mutateAsync: createRoom } = useCreateRoom()

  const startSSO = () => {
    SdkReverseClient.waitForAuthenticationAck().then(async () => {
      await other.refetch()
      submitCreateRoom()
    })
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=400,height=900,left=100,top=100`
    window.open(new URL('authenticate/', authUrl()).href, '', params)
  }

  const submitCreateRoom = () => {
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

  const submit = () => {
    if (isLoggedIn) {
      submitCreateRoom()
    } else {
      startSSO()
    }
  }

  return (
    <div
      className={css({
        paddingTop: '3px',
        paddingLeft: '3px',
      })}
    >
      {roomUrl ? (
        <RoomUrl roomUrl={roomUrl} />
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

const RoomUrl = ({ roomUrl }: { roomUrl: string }) => {
  const [isCopied, setIsCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(roomUrl!)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      })}
    >
      <span
        className={css({
          color: 'greyscale.600',
        })}
      >
        {roomUrl}
      </span>
      <Button
        variant={isCopied ? 'success' : 'quaternaryText'}
        data-attr="sdk-create-copy"
        onPress={copy}
        square
      >
        {isCopied ? <RiCheckLine /> : <RiFileCopyLine />}
      </Button>
    </div>
  )
}
