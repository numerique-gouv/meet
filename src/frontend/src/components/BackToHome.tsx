import { Link } from '@/primitives'
import { AProps } from '@/primitives/A'
import { useTranslation } from 'react-i18next'

export const BackToHome = ({ size }: { size?: AProps['size'] }) => {
  const { t } = useTranslation()
  return (
    <p>
      <Link to="/" size={size}>
        {t('backToHome')}
      </Link>
    </p>
  )
}
