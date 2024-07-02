import { Link } from 'wouter'
import { A } from '@/primitives/A'
import { H1 } from '@/primitives/H'
import { BoxScreen } from './BoxScreen'

export const NotFoundScreen = () => {
  return (
    <BoxScreen>
      <H1>Page not found</H1>
      <p>
        <Link to="/" asChild>
          <A size="small">Back to homescreen</A>
        </Link>
      </p>
    </BoxScreen>
  )
}
