import { Link } from 'wouter'
import { css } from '@/styled-system/css'
import { Stack } from '@/styled-system/jsx'
import { useTranslation } from 'react-i18next'
import { A, Button, Popover, PopoverList, Text } from '@/primitives'
import { SettingsButton } from '@/features/settings'
import { authUrl, logoutUrl, useUser } from '@/features/auth'
import { useMatchesRoute } from '@/utils/useMatchesRoute'
import { Feedback } from '@/components/Feedback'

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
      <Stack direction="row" justify="space-between" align="center">
        <header>
          <Stack gap={1} direction="row" align="center">
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
              <A href={authUrl()}>{t('login')}</A>
            )}
            {!!user && (
              <Popover aria-label={t('logout')}>
                <Button
                  size="sm"
                  invisible
                  tooltip={t('loggedInUserTooltip')}
                  tooltipType="delayed"
                >
                  {user.email}
                </Button>
                <PopoverList
                  items={[{ value: 'logout', label: t('logout') }]}
                  onAction={(value) => {
                    if (value === 'logout') {
                      window.location.href = logoutUrl()
                    }
                  }}
                />
              </Popover>
            )}
            <SettingsButton />
          </Stack>
        </nav>
      </Stack>
    </div>
  )
}
