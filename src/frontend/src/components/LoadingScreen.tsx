import { Screen, type ScreenProps } from '@/layout/Screen'
import { DelayedRender } from './DelayedRender'
import { CenteredContent } from '@/layout/CenteredContent'
import { useTranslation } from 'react-i18next'
import { Center } from '@/styled-system/jsx'

export const LoadingScreen = ({
  delay = 500,
  header = undefined,
  layout = 'centered',
}: {
  delay?: number
} & Omit<ScreenProps, 'children'>) => {
  const { t } = useTranslation()

  return (
    <DelayedRender delay={delay}>
      <Screen layout={layout} header={header}>
        <CenteredContent>
          <Center>
            <p>{t('loading')}</p>
          </Center>
        </CenteredContent>
      </Screen>
    </DelayedRender>
  )
}
