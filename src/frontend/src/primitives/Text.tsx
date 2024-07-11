import type { HTMLAttributes } from 'react'
import { RecipeVariantProps, cva, cx } from '@/styled-system/css'

const text = cva({
  base: {},
  variants: {
    variant: {
      h1: {
        textStyle: 'h1',
        marginBottom: 'heading',
      },
      h2: {
        textStyle: 'h2',
        marginBottom: 'heading',
      },
      h3: {
        textStyle: 'h3',
        marginBottom: 'heading',
      },
      body: {
        textStyle: 'body',
      },
      paragraph: {
        textStyle: 'body',
        marginBottom: 'paragraph',
      },
      small: {
        textStyle: 'small',
      },
      inherits: {},
    },
    bold: {
      true: {
        fontWeight: 'bold',
      },
      false: {
        fontWeight: 'normal',
      },
    },
    italic: {
      true: {
        fontStyle: 'italic',
      },
    },
    margin: {
      false: {
        margin: '0!',
      },
    },
  },
  defaultVariants: {
    variant: 'inherits',
  },
})

type TextHTMLProps = HTMLAttributes<HTMLElement>
type TextElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'strong'
  | 'em'
  | 'div'
export type As = { as?: TextElement }
export type TextProps = RecipeVariantProps<typeof text> & TextHTMLProps & As

export function Text(props: TextProps) {
  const [variantProps, componentProps] = text.splitVariantProps(props)
  const { as: Component = 'p', className, ...tagProps } = componentProps
  return (
    <Component className={cx(text(variantProps), className)} {...tagProps} />
  )
}
