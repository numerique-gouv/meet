import { useTranslation } from 'react-i18next'
import { navigate } from 'wouter/use-browser-location'
import {
  Button,
  P,
  Div,
  Text,
  H,
  VerticallyOffCenter,
  Dialog,
  Form,
  Field,
  Ul,
} from '@/primitives'
import { HStack } from '@/styled-system/jsx'
import { authUrl, useUser } from '@/features/auth'
import { isRoomValid, navigateToNewRoom } from '@/features/rooms'
import { Screen } from '@/layout/Screen'

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

            <Dialog title={t('joinMeeting')}>
              <Button variant="primary" outline>
                {t('joinMeeting')}
              </Button>
              <JoinMeetingDialogContent />
            </Dialog>
          </HStack>
        </Div>
      </VerticallyOffCenter>
    </Screen>
  )
}

const JoinMeetingDialogContent = () => {
  const { t } = useTranslation('home')
  return (
    <Div>
      <Form
        onSubmit={(data) => {
          navigate(`/${(data.roomId as string).trim()}`)
        }}
        submitLabel={t('joinInputSubmit')}
      >
        <Field
          type="text"
          name="roomId"
          label={t('joinInputLabel')}
          description={t('joinInputExample', {
            example: 'https://meet.numerique.gouv.fr/azer-tyu-qsdf',
          })}
          validate={(value) => {
            return !isRoomValid(value.trim()) ? (
              <>
                <p>{t('joinInputError')}</p>
                <Ul>
                  <li>{window.location.origin}/uio-azer-jkl</li>
                  <li>uio-azer-jkl</li>
                </Ul>
              </>
            ) : null
          }}
        />
      </Form>
      <H lvl={2}>{t('joinMeetingTipHeading')}</H>
      <P last>{t('joinMeetingTipContent')}</P>
    </Div>
  )
}
