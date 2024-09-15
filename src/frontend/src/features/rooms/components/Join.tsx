import { useTranslation } from 'react-i18next'
import { PreJoin, type LocalUserChoices } from '@livekit/components-react'
import { Screen } from '@/layout/Screen'
import { CenteredContent } from '@/layout/CenteredContent'

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  const { t } = useTranslation('rooms')

  return (
    <Screen layout="centered">
      <CenteredContent title={t('join.heading')}>
        <PreJoin
          persistUserChoices
          onSubmit={onSubmit}
          micLabel={t('join.audioinput.label')}
          camLabel={t('join.videoinput.label')}
          joinLabel={t('join.joinLabel')}
          userLabel={t('join.userLabel')}
        />
      </CenteredContent>
    </Screen>
  )
}
