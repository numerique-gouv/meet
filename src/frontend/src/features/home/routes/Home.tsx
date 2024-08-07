import { useTranslation } from 'react-i18next'
import { DialogTrigger } from 'react-aria-components'
import { Button, Text } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { navigateTo } from '@/navigation/navigateTo'
import { Screen } from '@/layout/Screen'
import { Centered } from '@/layout/Centered'
import { generateRoomId } from '@/features/rooms'
import { authUrl, useUser, UserAware } from '@/features/auth'
import { JoinMeetingDialog } from '../components/JoinMeetingDialog'
import { useCreateRoom } from '@/features/rooms'
import { usePersistentUserChoices } from '@livekit/components-react'

export const Home = () => {
  const { t } = useTranslation('home')
  const { isLoggedIn } = useUser()

  const {
    userChoices: { username },
  } = usePersistentUserChoices()

  const { mutateAsync: createRoom } = useCreateRoom({
    onSuccess: (data) => {
      navigateTo('room', data.slug, {
        state: { create: true, initialRoomData: data },
      })
    },
  })

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
            <Button
              variant="primary"
              onPress={
                isLoggedIn
                  ? async () => {
                      const slug = generateRoomId()
                      await createRoom({ slug, username })
                    }
                  : undefined
              }
              href={isLoggedIn ? undefined : authUrl()}
            >
              {isLoggedIn ? t('createMeeting') : t('login', { ns: 'global' })}
            </Button>

            <DialogTrigger>
              <Button variant="primary" outline>
                {t('joinMeeting')}
              </Button>
              <JoinMeetingDialog />
            </DialogTrigger>
          </HStack>
        </Centered>
      </Screen>
    </UserAware>
  )
}
