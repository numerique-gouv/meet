import { useTranslation } from 'react-i18next'

const langageLabels: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
}

export const useLanguageLabels = () => {
  const { i18n } = useTranslation()
  // cimode is a testing value from i18next, don't include it
  const supportedLanguages = (i18n.options.supportedLngs || []).filter(
    (lang) => lang !== 'cimode'
  )
  const languagesList = supportedLanguages.map((lang) => ({
    value: lang,
    label: langageLabels[lang],
  }))
  return {
    languagesList,
    currentLanguage: {
      key: i18n.language,
      label: langageLabels[i18n.language],
    },
  }
}
