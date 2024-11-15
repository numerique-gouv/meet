import { Trans, useTranslation } from 'react-i18next'
import { useLanguageLabels } from '@/i18n/useLanguageLabels'
import { A, Badge, Dialog, type DialogProps, Field, H, P } from '@/primitives'
import { logoutUrl, useUser } from '@/features/auth'
import { ProConnectButton } from '@/components/ProConnectButton'

export type SettingsDialogProps = Pick<DialogProps, 'isOpen' | 'onOpenChange'>

export const SettingsDialog = (props: SettingsDialogProps) => {
  const { t, i18n } = useTranslation('settings')
  const { user, isLoggedIn } = useUser()
  const { languagesList, currentLanguage } = useLanguageLabels()
  return (
    <Dialog title={t('dialog.heading')} {...props}>
      <H lvl={2}>{t('account.heading')}</H>
      {isLoggedIn ? (
        <>
          <P>
            <Trans
              i18nKey="settings:account.currentlyLoggedAs"
              values={{ user: user?.full_name || user?.email }}
              components={[<Badge />]}
            />
          </P>
          <P>
            <A href={logoutUrl()}>{t('logout', { ns: 'global' })}</A>
          </P>
        </>
      ) : (
        <>
          <P>{t('account.youAreNotLoggedIn')}</P>
          <ProConnectButton />
        </>
      )}
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
