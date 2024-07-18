import { useTranslation } from 'react-i18next'
import { A, Button, Italic, P, Div, H, Box } from '@/primitives'
import { authUrl, useUser } from '@/features/auth'
import { navigateToNewRoom } from '@/features/rooms'
import { Screen } from '@/layout/Screen'

export const Home = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'homepage' })
  const { isLoggedIn } = useUser()
  return (
    <Screen>
      <Box asScreen>
        <H lvl={1}>{t('heading')}</H>
        <P>{t('intro')}</P>
        <Div marginBottom="gutter">
          <Box variant="subtle" size="sm">
            {isLoggedIn ? (
              <Button variant="primary" onPress={() => navigateToNewRoom()}>
                {t('createMeeting')}
              </Button>
            ) : (
              <p>
                <A href={authUrl()}>{t('login')}</A>
              </p>
            )}
          </Box>
        </Div>
        <P>
          <Italic>{t('or')}</Italic>
        </P>
        <Box variant="subtle" size="sm">
          <p>{t('copyMeetingUrl')}</p>
        </Box>
      </Box>
    </Screen>
  )
}
