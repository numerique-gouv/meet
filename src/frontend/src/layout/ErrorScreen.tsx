import { BoxScreen } from './BoxScreen'
import { useTranslation } from 'react-i18next'

export const ErrorScreen = () => {
  const { t } = useTranslation()
  return <BoxScreen title={t('error.heading')} withBackButton />
}
