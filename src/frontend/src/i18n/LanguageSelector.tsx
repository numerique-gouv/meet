import { useTranslation } from 'react-i18next'
import { Button, Popover, PopoverList } from '@/primitives'
import { useLanguageLabels } from './useLanguageLabels'

export const LanguageSelector = () => {
  const { t, i18n } = useTranslation()
  const { languagesList, currentLanguage } = useLanguageLabels()
  return (
    <Popover aria-label={t('languageSelector.popoverLabel')}>
      <Button
        aria-label={t('languageSelector.buttonLabel', {
          currentLanguage: currentLanguage.label,
        })}
        size="sm"
        variant="primary"
        outline
      >
        {i18n.language}
      </Button>
      <PopoverList
        items={languagesList}
        onAction={(lang) => {
          i18n.changeLanguage(lang)
        }}
      />
    </Popover>
  )
}
