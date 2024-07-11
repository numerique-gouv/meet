import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'
import { apiUrl } from '@/api/apiUrl'
import { A, Badge, Text } from '@/primitives'
import { useUser } from '@/features/auth/api/useUser'

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
          {isLoggedIn === false && <A href={apiUrl('/authenticate')}>Login</A>}
          {!!user && (
            <p className={flex({ gap: 1, align: 'center' })}>
              <Badge>{user.email}</Badge>
              <A href={apiUrl('/logout')} size="small">
                Logout
              </A>
            </p>
          )}
        </div>
      </header>
    </div>
  )
}
