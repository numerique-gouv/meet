import {
  Button as RACButton,
  type ButtonProps as RACButtonsProps,
  Link,
  LinkProps,
} from 'react-aria-components'
import { cva, type RecipeVariantProps } from '@/styled-system/css'

const button = cva({
  base: {
    display: 'inline-block',
    paddingX: '1',
    paddingY: '0.625',
    transition: 'all 200ms',
    borderRadius: 8,
    cursor: 'pointer',
  },
  variants: {
    variant: {
      default: {
        color: 'control.text',
        backgroundColor: 'control',
        '_ra-hover': {
          backgroundColor: 'control.hover',
        },
        '_ra-pressed': {
          backgroundColor: 'control.active',
        },
      },
      primary: {
        color: 'primary.text',
        backgroundColor: 'primary',
        '_ra-hover': {
          backgroundColor: 'primary.hover',
        },
        '_ra-pressed': {
          backgroundColor: 'primary.active',
        },
      },
    },
  },
})

type ButtonProps = RecipeVariantProps<typeof button> &
  (RACButtonsProps | LinkProps)

export const Button = (props: ButtonProps) => {
  const [variantProps, componentProps] = button.splitVariantProps(props)
  if ((props as LinkProps).href !== undefined) {
    return <Link className={button(variantProps)} {...componentProps} />
  }
  return (
    <RACButton
      className={button(variantProps)}
      {...(componentProps as RACButtonsProps)}
    />
  )
}
