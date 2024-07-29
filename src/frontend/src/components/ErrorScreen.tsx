import { CenteredContent } from '@/layout/CenteredContent'
import { Screen } from '@/layout/Screen'
import { useTranslation } from 'react-i18next'

export const ErrorScreen = () => {
  const { t } = useTranslation()
  return (
    <Screen layout="centered">
      <CenteredContent title={t('error.heading')} withBackButton />
    </Screen>
  )
}
