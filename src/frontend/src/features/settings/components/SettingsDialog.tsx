import { Trans, useTranslation } from 'react-i18next'
import { useLanguageLabels } from '@/i18n/useLanguageLabels'
import { A, Badge, Dialog, Field, H, P } from '@/primitives'
import { authUrl, logoutUrl, useUser } from '@/features/auth'

export const SettingsDialog = () => {
  const { t, i18n } = useTranslation('settings')
  const { user, isLoggedIn } = useUser()
  const { languagesList, currentLanguage } = useLanguageLabels()
  return (
    <Dialog title={t('dialog.heading')}>
      <H lvl={2}>{t('account.heading')}</H>
      {isLoggedIn ? (
        <>
          <P>
            <Trans
              i18nKey="settings:account.currentlyLoggedAs"
              values={{ user: user?.email }}
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
          <P>
            <A href={authUrl()}>{t('login', { ns: 'global' })}</A>
          </P>
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
