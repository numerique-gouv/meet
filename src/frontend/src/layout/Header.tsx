import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'
import { A, Badge, Text } from '@/primitives'
import { authUrl, logoutUrl, useUser } from '@/features/auth'

export const Header = () => {
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
            Meet
          </Text>
        </div>
        <div>
          {isLoggedIn === false && <A href={authUrl()}>Login</A>}
          {!!user && (
            <p className={flex({ gap: 1, align: 'center' })}>
              <Badge>{user.email}</Badge>
              <A href={logoutUrl()} size="small">
                Logout
              </A>
            </p>
          )}
        </div>
      </header>
    </div>
  )
}
