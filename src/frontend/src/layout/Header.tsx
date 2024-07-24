import { Link } from 'wouter'
import { css } from '@/styled-system/css'
import { Stack } from '@/styled-system/jsx'
import { useTranslation } from 'react-i18next'
import { Text } from '@/primitives'
import { SettingsButton } from '@/features/settings'

export const Header = () => {
  const { t } = useTranslation()
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
      })}
    >
      <Stack direction="row" justify="space-between" align="center">
        <header>
          <Text bold variant="h1" margin={false}>
            <Link to="/">{t('app')}</Link>
          </Text>
        </header>
        <nav>
          <SettingsButton />
        </nav>
      </Stack>
    </div>
  )
}
