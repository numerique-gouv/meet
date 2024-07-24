import { useTranslation } from 'react-i18next'
import { Button, Div, Text, VerticallyOffCenter, Dialog } from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { authUrl, useUser } from '@/features/auth'
import { navigateToNewRoom } from '@/features/rooms'
import { Screen } from '@/layout/Screen'
import { JoinMeetingDialogContent } from '../components/JoinMeetingDialogContent'
import { SettingsButton } from '@/features/settings'

export const Home = () => {
  const { t } = useTranslation('home')
  const { isLoggedIn } = useUser()
  return (
    <Screen type="splash">
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
              onPress={isLoggedIn ? () => navigateToNewRoom() : undefined}
              href={isLoggedIn ? undefined : authUrl()}
            >
              {isLoggedIn ? t('createMeeting') : t('login', { ns: 'global' })}
            </Button>

            <Dialog>
              <Button variant="primary" outline>
                {t('joinMeeting')}
              </Button>
              <JoinMeetingDialogContent />
            </Dialog>

            <SettingsButton />
          </HStack>
        </Div>
      </VerticallyOffCenter>
    </Screen>
  )
}
