import { useTranslation } from 'react-i18next'
import { useLanguageLabels } from '@/i18n/useLanguageLabels'
import { Dialog, type DialogProps, Field, H } from '@/primitives'

export type SettingsDialogProps = Pick<DialogProps, 'isOpen' | 'onOpenChange'>

export const SettingsDialog = (props: SettingsDialogProps) => {
  const { t, i18n } = useTranslation('settings')
  const { languagesList, currentLanguage } = useLanguageLabels()
  return (
    <Dialog title={t('dialog.heading')} {...props}>
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
    </Dialog>
  )
}
