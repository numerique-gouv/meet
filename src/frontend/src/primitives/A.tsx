import { Link, type LinkProps } from 'react-aria-components'
import { cva, type RecipeVariantProps } from '@/styled-system/css'

const link = cva({
  base: {
    textDecoration: 'underline',
    textUnderlineOffset: '2',
    cursor: 'pointer',
    borderRadius: 2,
    '_ra-hover': {
      textDecoration: 'none',
    },
    '_ra-pressed': {
      textDecoration: 'underline',
    },
  },
  variants: {
    size: {
      sm: {
        textStyle: 'sm',
      },
    },
  },
})

export type AProps = LinkProps & RecipeVariantProps<typeof link>

/**
 * anchor component styled with underline. Used mostly for external links. Use Link for internal links
 */
export const A = ({ size, ...props }: AProps) => {
  return <Link {...props} className={link({ size })} />
}
