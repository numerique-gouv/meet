import { useTranslation } from 'react-i18next'
import { Text } from '@/primitives'
import { Screen } from '@/layout/Screen'
import { CenteredContent } from '@/layout/CenteredContent'

export const FeedbackRoute = () => {
  const { t } = useTranslation('rooms')
  return (
    <Screen layout="centered">
      <CenteredContent title={t('feedback.heading')} withBackButton>
        <Text as="p" variant="h3" centered>
          {t('feedback.body')}
        </Text>
      </CenteredContent>
    </Screen>
  )
}
