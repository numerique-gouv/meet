import { useTranslation } from 'react-i18next'
import { P } from '@/primitives'
import { Screen } from '@/layout/Screen'
import { CenteredContent } from '@/layout/CenteredContent'

export const FeedbackRoute = () => {
  const { t } = useTranslation('rooms')
  return (
    <Screen layout="centered">
      <CenteredContent title={t('feedback.heading')} withBackButton>
        <P>{t('feedback.body')}</P>
      </CenteredContent>
    </Screen>
  )
}
