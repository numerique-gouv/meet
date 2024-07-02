import { Link } from 'wouter'
import { A } from '@/primitives/A'
import { H1 } from '@/primitives/H'
import { BoxScreen } from './BoxScreen'

export const ForbiddenScreen = () => {
  return (
    <BoxScreen>
      <H1>You don't have the permission to view this page</H1>
      <p>
        <Link to="/" asChild>
          <A size="small">Back to homescreen</A>
        </Link>
      </p>
    </BoxScreen>
  )
}
