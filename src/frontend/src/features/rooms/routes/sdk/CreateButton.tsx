import { Button } from '@/primitives/Button'
import { useTranslation } from 'react-i18next'
import { generateRoomId } from '../../utils/generateRoomId'
import { useCreateRoom } from '../../api/createRoom'
import { usePersistentUserChoices } from '@livekit/components-react'
import { useState } from 'react'
import { getRouteUrl } from '@/navigation/getRouteUrl'
import { css } from '@/styled-system/css'
import { RiCheckLine, RiFileCopyLine } from '@remixicon/react'
import { Loader } from '@/primitives/Loader'
import { VisioIcon } from '@/assets/VisioIcon'

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
      })
    }, 2000)
  }

  const [isCopied, setIsCopied] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(roomUrl!)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1000)
  }

  return (
    <div className={css({})}>
      {roomUrl ? (
        <Button
          variant={isCopied ? 'success' : 'tertiaryText'}
          onHoverChange={setIsHovered}
          data-attr="sdk-create-copy"
          onPress={copy}
          icon={
            isCopied ? (
              <RiCheckLine size={18} style={{ marginRight: '8px' }} />
            ) : undefined
          }
        >
          {isCopied ? (
            th('laterMeetingDialog.copied')
          ) : (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                color: 'greyscale.600',
                gap: '0.5rem',
              })}
            >
              <div>{roomUrl}</div>
              <RiFileCopyLine size={24} />
            </div>
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
