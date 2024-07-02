import { useLocation } from 'wouter'
import { useUser } from '@/queries/useUser'
import { Button } from '@/primitives/Button'
import { A } from '@/primitives/A'
import { Bold } from '@/primitives/Bold'
import { H1 } from '@/primitives/H'
import { P } from '@/primitives/P'
import { Hr } from '@/primitives/Hr'
import { apiUrl } from '@/api/apiUrl'
import { createRandomRoom } from '@/utils/createRandomRoom'
import { LoadingScreen } from '@/layout/LoadingScreen'
import { BoxScreen } from '@/layout/BoxScreen'

export const Home = () => {
  const { status, isLoggedIn } = useUser()
  const [, navigate] = useLocation()

  if (status === 'pending') {
    return <LoadingScreen asBox />
  }

  return (
    <BoxScreen>
      <H1>
        Welcome in <Bold>Meet</Bold>!
      </H1>
      {isLoggedIn ? (
        <Button onPress={() => navigate(`/${createRandomRoom()}`)}>
          Create a conference call
        </Button>
      ) : (
        <>
          <P>What do you want to do? You can either:</P>
          <Hr aria-hidden="true" />
          <P>
            <A href={apiUrl('/authenticate')}>
              Login to create a conference call
            </A>
          </P>
          <Hr aria-hidden="true" />
          <P>
            <span style={{ fontStyle: 'italic' }}>Or </span> copy a URL in your
            browser address bar to join an existing conference call
          </P>
        </>
      )}
    </BoxScreen>
  )
}
