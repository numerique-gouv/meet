import { useTranslation } from 'react-i18next'
import { DialogTrigger } from 'react-aria-components'
import { Button, Div, Text, VerticallyOffCenter } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { navigateTo } from '@/navigation/navigateTo'
import { generateRoomId } from '@/features/rooms'
import { authUrl, useUser } from '@/features/auth'
import { Screen } from '@/layout/Screen'
import { JoinMeetingDialog } from '../components/JoinMeetingDialog'

export const Home = () => {
  const { t } = useTranslation('home')
  const { isLoggedIn } = useUser()
  return (
    <Screen>
      <VerticallyOffCenter>
        <Div margin="auto" width="fit-content">
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
                  ? () =>
                      navigateTo('room', generateRoomId(), {
                        state: { create: true },
                      })
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
        </Div>
      </VerticallyOffCenter>
    </Screen>
  )
}
