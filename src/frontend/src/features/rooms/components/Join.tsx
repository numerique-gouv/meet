import { useTranslation } from 'react-i18next'
import { Box } from '@/layout/Box'
import { PreJoin, type LocalUserChoices } from '@livekit/components-react'

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  const { t } = useTranslation('rooms')

  return (
    <Box title={t('join.heading')} withBackButton>
      <PreJoin persistUserChoices onSubmit={onSubmit} />
    </Box>
  )
}
