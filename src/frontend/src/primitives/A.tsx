import { Link, type LinkProps } from 'react-aria-components'
import { cva, type RecipeVariantProps } from '@/styled-system/css'

const link = cva({
  base: {
    textDecoration: 'underline',
    textUnderlineOffset: '2',
    transition: 'all 200ms',
    cursor: 'pointer',
    '_ra-hover': {
      textDecoration: 'none',
    },
    '_ra-pressed': {
      textDecoration: 'underline',
    },
  },
  variants: {
    size: {
      small: {
        textStyle: 'small',
      },
    },
  },
})

export type AProps = LinkProps & RecipeVariantProps<typeof link>

/**
 * anchor component styled with underline
 */
export const A = ({ size, ...props }: AProps) => {
  return <Link {...props} className={link({ size })} />
}
