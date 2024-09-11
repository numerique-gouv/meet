import { useTranslation } from 'react-i18next'
import { DialogTrigger } from 'react-aria-components'
import { Button, Menu, Text } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { navigateTo } from '@/navigation/navigateTo'
import { Screen } from '@/layout/Screen'
import { Centered } from '@/layout/Centered'
import { generateRoomId } from '@/features/rooms'
import { authUrl, useUser, UserAware } from '@/features/auth'
import { JoinMeetingDialog } from '../components/JoinMeetingDialog'
import { useCreateRoom } from '@/features/rooms'
import { usePersistentUserChoices } from '@livekit/components-react'
import { menuItemRecipe } from '@/primitives/menuItemRecipe'
import { RiAddLine, RiLink } from '@remixicon/react'
import { MenuItem, Menu as RACMenu } from 'react-aria-components'
import { LaterMeetingDialog } from '@/features/home/components/LaterMeetingDialog'
import { useState } from 'react'

export const Home = () => {
  const { t } = useTranslation('home')
  const { isLoggedIn } = useUser()

  const {
    userChoices: { username },
  } = usePersistentUserChoices()

  const { mutateAsync: createRoom } = useCreateRoom()
  const [laterRoomId, setLaterRoomId] = useState<null | string>(null)

  return (
    <UserAware>
      <Screen>
        <Centered width="fit-content">
          <Text as="h1" variant="display">
            {t('heading')}
          </Text>
          <Text as="p" variant="h3">
            {t('intro')}
          </Text>
          {!isLoggedIn && (
            <Text margin="sm" variant="note">
              {t('loginToCreateMeeting')}
            </Text>
          )}
          <HStack gap="gutter">
            {isLoggedIn ? (
              <Menu>
                <Button variant="primary">{t('createMeeting')}</Button>
                <RACMenu>
                  <MenuItem
                    className={menuItemRecipe({ icon: true })}
                    onAction={async () => {
                      const slug = generateRoomId()
                      createRoom({ slug, username }).then((data) =>
                        navigateTo('room', data.slug, {
                          state: { create: true, initialRoomData: data },
                        })
                      )
                    }}
                  >
                    <RiAddLine size={18} />
                    {t('createMenu.instantOption')}
                  </MenuItem>
                  <MenuItem
                    className={menuItemRecipe({ icon: true })}
                    onAction={() => {
                      const slug = generateRoomId()
                      createRoom({ slug, username }).then((data) =>
                        setLaterRoomId(data.slug)
                      )
                    }}
                  >
                    <RiLink size={18} />
                    {t('createMenu.laterOption')}
                  </MenuItem>
                </RACMenu>
              </Menu>
            ) : (
              <Button variant="primary" href={authUrl()}>
                {t('login', { ns: 'global' })}
              </Button>
            )}
            <DialogTrigger>
              <Button variant="primary" outline>
                {t('joinMeeting')}
              </Button>
              <JoinMeetingDialog />
            </DialogTrigger>
          </HStack>
        </Centered>
        <LaterMeetingDialog
          roomId={laterRoomId || ''}
          onOpenChange={() => setLaterRoomId(null)}
        />
      </Screen>
    </UserAware>
  )
}
