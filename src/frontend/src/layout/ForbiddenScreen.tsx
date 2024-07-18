import { BoxScreen } from './BoxScreen'
import { useTranslation } from 'react-i18next'

export const ForbiddenScreen = () => {
  const { t } = useTranslation()
  return <BoxScreen title={t('forbidden.heading')} withBackButton />
}
