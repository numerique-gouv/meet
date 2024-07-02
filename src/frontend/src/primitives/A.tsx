import { RecipeVariantProps, cva } from '@/styled-system/css'
import {
  Link as Link,
  type LinkProps as LinksProps,
} from 'react-aria-components'

const link = cva({
  base: {
    textDecoration: 'underline',
    textUnderlineOffset: '2',
    transition: 'all 200ms',
    cursor: 'pointer',
    _hover: {
      textDecoration: 'none',
    },
    _pressed: {
      textDecoration: 'underline',
    },
  },
  variants: {
    size: {
      small: {
        fontSize: 'sm',
      },
    },
  },
})

export const A = ({
  size,
  ...props
}: LinksProps & RecipeVariantProps<typeof link>) => {
  return <Link {...props} className={link({ size })} />
}
