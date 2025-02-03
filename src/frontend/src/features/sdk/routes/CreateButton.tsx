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
  const { isLoggedIn } = useUser()
  console.log('isLoggedIn', isLoggedIn)
  const { t } = useTranslation('sdk', { keyPrefix: 'createButton' })
  const [roomUrl, setRoomUrl] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const {
    userChoices: { username },
  } = usePersistentUserChoices()

  const { mutateAsync: createRoom } = useCreateRoom()

  /**
   * Listen to the broadcast channel. When the window opened via startSSO will be redirected to the success page,
   * it will broadcast an AUTHENTICATED message which this function will use to re-fetch the user.
   * Once this is done we will broadcast an AUTHENTICATED_ACK message to the opened window which will be waiting
   * for it to close itself.
   */
  const setupBroadcastChannel = () => {
    const bc = new BroadcastChannel('APP_CHANNEL')
    bc.onmessage = async (event) => {
      console.log('EVENT BROADCAST', event.data)
      if (event.data.type === 'AUTHENTICATED') {
        // await init?.()
        bc.postMessage({ type: 'AUTHENTICATED_ACK' })
        submitCreateRoom()
      }
    }
  }

  const startSSO = () => {
    setupBroadcastChannel()
    const params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=400,height=900,left=100,top=100`
    window.open(new URL('authenticate/', authUrl()).href, '', params)
  }

  const submitCreateRoom = () => {
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
        <RoomButton roomUrl={roomUrl} />
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

const RoomButton = ({ roomUrl }: { roomUrl: string }) => {
  const { t } = useTranslation('sdk', { keyPrefix: 'createButton' })
  const { t: th } = useTranslation('home')
  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(roomUrl!)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <>
      {roomUrl}
      <Button
        variant={isCopied ? 'success' : 'quaternaryText'}
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
    </>
  )
}
