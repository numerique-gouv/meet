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
    transition: 'background 200ms, outline 200ms, border-color 200ms',
    cursor: 'pointer',
    border: '1px solid transparent',
    color: 'colorPalette.text',
    backgroundColor: 'colorPalette',
    '&[data-hovered]': {
      backgroundColor: 'colorPalette.hover',
    },
    '&[data-pressed]': {
      backgroundColor: 'colorPalette.active',
    },
  },
  variants: {
    size: {
      default: {
        borderRadius: 8,
        paddingX: '1',
        paddingY: '0.625',
        '--square-padding': '{spacing.0.625}',
      },
      sm: {
        borderRadius: 4,
        paddingX: '0.5',
        paddingY: '0.25',
        '--square-padding': '{spacing.0.25}',
      },
      xs: {
        borderRadius: 4,
        '--square-padding': '0',
      },
    },
    square: {
      true: {
        paddingX: 'var(--square-padding)',
        paddingY: 'var(--square-padding)',
      },
    },
    variant: {
      default: {
        colorPalette: 'control',
      },
      primary: {
        colorPalette: 'primary',
      },
    },
    outline: {
      true: {
        color: 'colorPalette',
        backgroundColor: 'transparent!',
        borderColor: 'currentcolor!',
        '&[data-hovered]': {
          backgroundColor: 'colorPalette.subtle!',
        },
        '&[data-pressed]': {
          backgroundColor: 'colorPalette.subtle!',
        },
      },
    },
    invisible: {
      true: {
        borderColor: 'none!',
        backgroundColor: 'none!',
        '&[data-hovered]': {
          backgroundColor: 'none!',
          borderColor: 'currentcolor',
        },
        '&[data-pressed]': {
          borderColor: 'currentcolor',
        },
      },
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
    outline: false,
  },
})

export type ButtonProps = RecipeVariantProps<typeof button> & RACButtonsProps

type LinkButtonProps = RecipeVariantProps<typeof button> & LinkProps

type ButtonOrLinkProps = ButtonProps | LinkButtonProps

export const Button = (props: ButtonOrLinkProps) => {
  const [variantProps, componentProps] = button.splitVariantProps(props)
  if ((props as LinkButtonProps).href !== undefined) {
    return <Link className={button(variantProps)} {...componentProps} />
  }
  return (
    <RACButton
      className={button(variantProps)}
      {...(componentProps as RACButtonsProps)}
    />
  )
}
