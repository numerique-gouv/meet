import { apiUrl } from '@/api/apiUrl'
import { A } from '@/primitives/A'
import { useUser } from '@/queries/useUser'
import { css } from '@/styled-system/css'
import { flex } from '@/styled-system/patterns'

export const Header = () => {
  const { user, isLoggedIn } = useUser()
  return (
    <div
      className={css({
        backgroundColor: 'white',
        padding: '1',
        flexShrink: 0,
        color: '#000091',
        boxShadow: '#00000040 0px 1px 4px',
      })}
    >
      <header
        className={flex({
          justify: 'space-between',
          align: 'center',
        })}
      >
        <div>
          <p
            className={css({
              fontWeight: 'bold',
              fontSize: '2xl',
            })}
          >
            Meet
          </p>
        </div>
        <div>
          {isLoggedIn === false && <A href={apiUrl('/authenticate')}>Login</A>}
          {!!user && (
            <p>
              {user.email}&nbsp;&nbsp;<A href={apiUrl('/logout')}>Logout</A>
            </p>
          )}
        </div>
      </header>
    </div>
  )
}
