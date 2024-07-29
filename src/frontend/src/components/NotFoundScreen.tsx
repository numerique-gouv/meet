import { CenteredContent } from '@/layout/CenteredContent'
import { Screen } from '@/layout/Screen'
import { useTranslation } from 'react-i18next'

export const NotFoundScreen = () => {
  const { t } = useTranslation()
  return (
    <Screen layout="centered">
      <CenteredContent title={t('notFound.heading')} withBackButton />
    </Screen>
  )
}
