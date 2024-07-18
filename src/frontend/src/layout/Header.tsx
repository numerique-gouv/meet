import { useTranslation } from 'react-i18next'
import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'
import { A, Badge, Text } from '@/primitives'
import { authUrl, logoutUrl, useUser } from '@/features/auth'
import { Link } from 'wouter'

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
      <header
        className={flex({
          justify: 'space-between',
          align: 'center',
        })}
      >
        <div>
          <Text bold variant="h1" margin={false}>
            <Link to="/">{t('app')}</Link>
          </Text>
        </div>
        <div>
          {isLoggedIn === false && <A href={authUrl()}>{t('login')}</A>}
          {!!user && (
            <p className={flex({ gap: 1, align: 'center' })}>
              <Badge>{user.email}</Badge>
              <A href={logoutUrl()} size="small">
                {t('logout')}
              </A>
            </p>
          )}
        </div>
      </header>
    </div>
  )
}
