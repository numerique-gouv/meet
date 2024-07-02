import { Link } from 'wouter'
import { A } from '@/primitives/A'
import { H1 } from '@/primitives/H'
import { BoxScreen } from './BoxScreen'

export const ErrorScreen = () => {
  return (
    <BoxScreen>
      <H1>An error occured while loading the page</H1>
      <p>
        <Link to="/" asChild>
          <A size="small">Back to homescreen</A>
        </Link>
      </p>
    </BoxScreen>
  )
}
