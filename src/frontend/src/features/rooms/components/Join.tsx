import { useTranslation } from 'react-i18next'
import { PreJoin, type LocalUserChoices } from '@livekit/components-react'
import { Screen } from '@/layout/Screen'
import { CenteredContent } from '@/layout/CenteredContent'
import { useUser } from '@/features/auth'

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  const { t } = useTranslation('rooms')
  const { user } = useUser()

  return (
    <Screen layout="centered" footer={false}>
      <CenteredContent title={t('join.heading')}>
        <PreJoin
          persistUserChoices
          onSubmit={onSubmit}
          micLabel={t('join.audioinput.label')}
          camLabel={t('join.videoinput.label')}
          joinLabel={t('join.joinLabel')}
          userLabel={t('join.usernameLabel')}
          defaults={{ username: user?.full_name }}
        />
      </CenteredContent>
    </Screen>
  )
}
