import { A, Text } from '@/primitives'
import { useTranslation } from 'react-i18next'

const MANIFEST_LINK =
  'https://docs.numerique.gouv.fr/docs/1ef86abf-f7e0-46ce-b6c7-8be8b8af4c3d/'

export const MoreLink = () => {
  const { t } = useTranslation('home')

  return (
    <Text as={'p'} variant={'sm'} style={{ padding: '1rem 0' }}>
      <A
        href={MANIFEST_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('moreLinkLabel')}
      >
        {t('moreLink')}
      </A>{' '}
      {t('moreAbout')}
    </Text>
  )
}
