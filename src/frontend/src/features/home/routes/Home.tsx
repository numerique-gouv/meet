import { useTranslation } from 'react-i18next'
import { navigate } from 'wouter/use-browser-location'
import { Form } from 'react-aria-components'
import { HStack } from '@/styled-system/jsx'
import {
  Button,
  P,
  Div,
  Text,
  H,
  VerticallyOffCenter,
  Dialog,
  TextField,
} from '@/primitives'
import { useCloseDialog } from '@/primitives/Dialog'
import { authUrl, useUser } from '@/features/auth'
import { navigateToNewRoom } from '@/features/rooms'
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
  const closeDialog = useCloseDialog()
  const fieldOk = /^.*([a-z]{3}-[a-z]{4}-[a-z]{3})$/
  return (
    <Div>
      <Form
        onSubmit={(event) => {
          event.preventDefault()
          const roomInput = document.getElementById(
            'join-meeting-input'
          ) as HTMLInputElement
          const value = roomInput.value
          const matches = value.match(fieldOk)
          if (matches) {
            navigate(`/${matches[1]}`)
          }
        }}
      >
        <TextField
          id="join-meeting-input"
          label={t('joinInputLabel')}
          description={t('joinInputExample', {
            example: 'https://meet.numerique.gouv.fr/azer-tyu-qsdf',
          })}
          validate={(value) => {
            if (!fieldOk.test(value)) {
              return t('joinInputError')
            }
            return null
          }}
        />
        <HStack gap="gutter">
          <Button type="submit" variant="primary">
            {t('joinInputSubmit')}
          </Button>
          <Button variant="primary" outline onPress={closeDialog}>
            {t('cancel', { ns: 'global' })}
          </Button>
        </HStack>
      </Form>
      <H lvl={2}>{t('joinMeetingTipHeading')}</H>
      <P last>{t('joinMeetingTipContent')}</P>
    </Div>
  )
}
