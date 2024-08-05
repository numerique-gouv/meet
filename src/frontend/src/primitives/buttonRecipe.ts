import { type RecipeVariantProps, cva } from '@/styled-system/css'

export type ButtonRecipe = typeof buttonRecipe

export type ButtonRecipeProps = RecipeVariantProps<ButtonRecipe>

export const buttonRecipe = cva({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
      // @TODO: better handling of colors… this is a mess
      success: {
        colorPalette: 'success',
        borderColor: 'success.300',
        color: 'success.subtle-text',
        backgroundColor: 'success.subtle',
        '&[data-hovered]': {
          backgroundColor: 'success.200',
        },
        '&[data-pressed]': {
          backgroundColor: 'success.subtle!',
        },
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
          borderColor: 'colorPalette.active!',
        },
        '&[data-pressed]': {
          borderColor: 'currentcolor',
        },
      },
    },
    fullWidth: {
      true: {
        width: 'full',
      },
    },
    legacyStyle: {
      true: {
        borderColor: 'gray.400',
        '&[data-hovered]': {
          borderColor: 'gray.500',
        },
        '&[data-pressed]': {
          borderColor: 'gray.500',
        },
        '&[data-selected]': {
          background: '#e5e7eb',
          borderColor: 'gray.400',
          '&[data-hovered]': {
            backgroundColor: 'gray.300',
          },
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
