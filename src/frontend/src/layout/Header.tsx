import { Link } from 'wouter'
import { css } from '@/styled-system/css'
import { Stack } from '@/styled-system/jsx'
import { useTranslation } from 'react-i18next'
import { Text, Button } from '@/primitives'
import { SettingsButton } from '@/features/settings'
import { logoutUrl, useUser } from '@/features/auth'
import { useMatchesRoute } from '@/navigation/useMatchesRoute'
import { Feedback } from '@/components/Feedback'
import { Menu } from '@/primitives/Menu'
import { MenuList } from '@/primitives/MenuList'
import { ProConnectButton } from '@/components/ProConnectButton'
import { terminateAnalyticsSession } from '@/features/analytics/hooks/useAnalytics'
import { terminateSupportSession } from '@/features/support/hooks/useSupport'

export const Header = () => {
  const { t } = useTranslation()
  const isHome = useMatchesRoute('home')
  const isRoom = useMatchesRoute('room')
  const { user, isLoggedIn } = useUser()

  return (
    <div
      className={css({
        borderBottomColor: 'box.border',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        paddingY: 1,
        paddingX: 1,
        flexShrink: 0,
      })}
    >
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          rowGap: 1,
          md: {
            rowGap: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        })}
      >
        <header>
          <Stack gap={2.25} direction="row" align="center">
            <Text bold variant="h1" margin={false}>
              <Link
                onClick={(event) => {
                  if (
                    isRoom &&
                    !window.confirm(t('leaveRoomPrompt', { ns: 'rooms' }))
                  ) {
                    event.preventDefault()
                  }
                }}
                to="/"
              >
                {t('app')}
              </Link>
            </Text>
            <Feedback />
          </Stack>
        </header>
        <nav>
          <Stack gap={1} direction="row" align="center">
            {isLoggedIn === false && !isHome && (
              <ProConnectButton hint={false} />
            )}
            {!!user && (
              <Menu>
                <Button
                  size="sm"
                  invisible
                  tooltip={t('loggedInUserTooltip')}
                  tooltipType="delayed"
                >
                  {user.email}
                </Button>
                <MenuList
                  items={[{ value: 'logout', label: t('logout') }]}
                  onAction={(value) => {
                    if (value === 'logout') {
                      terminateAnalyticsSession()
                      terminateSupportSession()
                      window.location.href = logoutUrl()
                    }
                  }}
                />
              </Menu>
            )}
            <SettingsButton />
          </Stack>
        </nav>
      </div>
    </div>
  )
}
