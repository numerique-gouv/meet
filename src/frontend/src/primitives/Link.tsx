import { Link as WouterLink } from 'wouter'
import { A, type AProps } from './A'

/**
 * Wouter link wrapper to use our A primitive
 */
export const Link = ({
  to,
  ...props
}: {
  to: string
} & AProps) => {
  return (
    <WouterLink to={to} asChild>
      <A {...props} />
    </WouterLink>
  )
}
