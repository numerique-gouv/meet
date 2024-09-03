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
    '&[data-selected]': {
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
        borderColor: 'control.subtle',
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
      danger: {
        colorPalette: 'danger',
        borderColor: 'danger.600',
        color: 'danger.subtle-text',
        backgroundColor: 'danger.subtle',
        '&[data-hovered]': {
          backgroundColor: 'danger.200',
        },
        '&[data-pressed]': {
          backgroundColor: 'danger.subtle!',
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
    // if the button is next to other ones to make a "button group", tell where the button is to handle radius
    groupPosition: {
      left: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      right: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderLeft: 0,
      },
      center: {
        borderRadius: 0,
      },
    },
    // some toggle buttons make more sense without a "pushed button" style when selected because their content changes to mark the state
    toggledStyles: {
      false: {
        '&[data-selected]': {
          backgroundColor: 'colorPalette',
        },
      },
    },
    legacyStyle: {
      true: {
        borderColor: 'gray.400',
        transition: 'border 200ms, background 200ms, color 200ms',
        '&[data-hovered]': {
          borderColor: 'gray.500',
        },
        '&[data-pressed]': {
          borderColor: 'gray.500',
        },
        '&[data-selected]': {
          backgroundColor: '#1d4ed8',
          color: 'white',
          borderColor: 'gray.500',
          '&[data-hovered]': {
            borderColor: '#6b7280',
            backgroundColor: '#1e40af',
          },
        },
      },
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
    outline: false,
    toggledStyles: true,
  },
})
