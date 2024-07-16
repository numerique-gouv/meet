import { A, Button, Italic, P, Div, H, Box } from '@/primitives'
import {authUrl, useUser} from '@/features/auth'
import { navigateToNewRoom } from '@/features/rooms'
import { Screen } from '@/layout/Screen'

export const Home = () => {
  const { isLoggedIn } = useUser()
  return (
    <Screen>
      <Box asScreen>
        <H lvl={1}>Welcome in Meet</H>
        <P>What do you want to do? You can either:</P>
        <Div marginBottom="gutter">
          <Box variant="subtle" size="sm">
            {isLoggedIn ? (
              <Button variant="primary" onPress={() => navigateToNewRoom()}>
                Create a conference call
              </Button>
            ) : (
              <p>
                <A href={authUrl()}>
                  Login to create a conference call
                </A>
              </p>
            )}
          </Box>
        </Div>
        <P>
          <Italic>Or</Italic>
        </P>
        <Box variant="subtle" size="sm">
          <p>
            copy a meeting URL in your browser address bar to join an existing
            conference call
          </p>
        </Box>
      </Box>
    </Screen>
  )
}
