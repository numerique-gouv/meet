import { Field, H } from '@/primitives'
import { useTranslation } from 'react-i18next'
import { useLanguageLabels } from '@/i18n/useLanguageLabels'
import { TabPanel, TabPanelProps } from '@/primitives/Tabs'

export type GeneralTabProps = Pick<TabPanelProps, 'id'>

export const GeneralTab = ({ id }: GeneralTabProps) => {
  const { t, i18n } = useTranslation('settings')
  const { languagesList, currentLanguage } = useLanguageLabels()

  return (
    <TabPanel padding={'md'} flex id={id}>
      <H lvl={2}>{t('language.heading')}</H>
      <Field
        type="select"
        label={t('language.label')}
        items={languagesList}
        defaultSelectedKey={currentLanguage.key}
        onSelectionChange={(lang) => {
          i18n.changeLanguage(lang as string)
        }}
      />
    </TabPanel>
  )
}
