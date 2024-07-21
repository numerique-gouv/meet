import { Link } from 'wouter'
import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'
import { Stack } from '@/styled-system/jsx'
import { useTranslation } from 'react-i18next'
import { LanguageSelector } from '@/i18n/LanguageSelector'
import { A, Badge, Text } from '@/primitives'
import { authUrl, logoutUrl, useUser } from '@/features/auth'

export const Header = () => {
  const { t } = useTranslation()
  const { user, isLoggedIn } = useUser()
  return (
    <div
      className={css({
        backgroundColor: 'primary.text',
        color: 'primary',
        borderBottomColor: 'box.border',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        padding: 1,
        flexShrink: 0,
        boxShadow: 'box',
      })}
    >
      <Stack direction="row" justify="space-between" align="center">
        <header>
          <Text bold variant="h1" margin={false}>
            <Link to="/">{t('app')}</Link>
          </Text>
        </header>
        <nav>
          <Stack gap={1} direction="row" align="center">
            <LanguageSelector />
            {isLoggedIn === false && <A href={authUrl()}>{t('login')}</A>}
            {!!user && (
              <p className={flex({ gap: 1, align: 'center' })}>
                <Badge>{user.email}</Badge>
                <A href={logoutUrl()} size="small">
                  {t('logout')}
                </A>
              </p>
            )}
          </Stack>
        </nav>
      </Stack>
    </div>
  )
}
