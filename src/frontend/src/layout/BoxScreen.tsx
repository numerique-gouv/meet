import { Screen } from './Screen'
import { Box, type BoxProps } from './Box'

export const BoxScreen = (props: BoxProps) => {
  return (
    <Screen>
      <Box {...props} />
    </Screen>
  )
}
