import { useTranslation } from 'react-i18next'
import { BoxScreen } from './BoxScreen'

export const NotFoundScreen = () => {
  const { t } = useTranslation()
  return <BoxScreen title={t('notFound.heading')} withBackButton />
}
