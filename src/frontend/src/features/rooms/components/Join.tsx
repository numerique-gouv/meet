import { Box } from '@/layout/Box'
import { PreJoin, type LocalUserChoices } from '@livekit/components-react'

export const Join = ({
  onSubmit,
}: {
  onSubmit: (choices: LocalUserChoices) => void
}) => {
  return (
    <Box title="Verify your settings before joining" withBackButton>
      <PreJoin
        persistUserChoices
        onSubmit={onSubmit}
      />
    </Box>
  )
}
