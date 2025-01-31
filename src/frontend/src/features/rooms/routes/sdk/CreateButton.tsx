import { Button } from '@/primitives/Button'
import { useTranslation } from 'react-i18next'

export const SdkCreateButton = () => {
  const { t } = useTranslation('sdk', { keyPrefix: 'createButton' })
  return (
    <div>
      <Button variant="primaryDark" aria-label={t('label')}>
        {t('label')}
      </Button>
    </div>
  )
}
