import { type RecipeVariantProps, cva } from '@/styled-system/css'

export const buttonRecipe = cva({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'background 200ms, outline 200ms, border-color 200ms',
    cursor: 'pointer',
    border: '1px solid transparent',
  },
  variants: {
    size: {
      default: {
        borderRadius: 4,
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
      primary: {
        backgroundColor: 'primary.800',
        color: 'white',
        '&[data-hovered]': {
          backgroundColor: 'primary.action',
        },
        '&[data-pressed]': {
          backgroundColor: 'primary.action',
        },
        '&[data-disabled]': {
          backgroundColor: 'greyscale.100',
          color: 'greyscale.400',
        },
      },
      secondary: {
        backgroundColor: 'white',
        color: 'primary.800',
        borderColor: 'primary.800',
        '&[data-hovered]': {
          backgroundColor: 'greyscale.100',
        },
        '&[data-pressed]': {
          backgroundColor: 'greyscale.100',
        },
      },
      secondaryText: {
        backgroundColor: 'transparent',
        color: 'primary.800',
        '&[data-hovered]': {
          backgroundColor: 'greyscale.100',
        },
        '&[data-pressed]': {
          backgroundColor: 'greyscale.100',
        },
        '&[data-disabled]': {
          color: 'greyscale.400',
        },
      },
      tertiary: {
        backgroundColor: 'primary.100',
        color: 'primary.800',
        '&[data-hovered]': {
          backgroundColor: 'primary.300',
        },
        '&[data-pressed]': {
          backgroundColor: 'primary.300',
        },
      },
      tertiaryText: {
        backgroundColor: 'transparent',
        color: 'primary.900',
        '&[data-hovered]': {
          backgroundColor: 'primary.300',
        },
        '&[data-pressed]': {
          backgroundColor: 'primary.300',
        },
      },
      primaryDark: {
        backgroundColor: 'primaryDark.100',
        color: 'white',
        '&[data-pressed]': {
          backgroundColor: 'primaryDark.900',
          color: 'primaryDark.100',
        },
        '&[data-hovered]': {
          backgroundColor: 'primaryDark.300',
          color: 'white',
        },
        '&[data-selected]': {
          backgroundColor: 'primaryDark.700 !important',
          color: 'primaryDark.100 !important',
        },
      },
      primaryTextDark: {
        backgroundColor: 'transparent',
        color: 'white',
        '&[data-hovered]': {
          backgroundColor: 'primaryDark.100',
        },
        '&[data-pressed]': {
          backgroundColor: 'primaryDark.700',
          color: 'primaryDark.100',
        },
        '&[data-selected]': {
          backgroundColor: 'primaryDark.700',
          color: 'primaryDark.100',
        },
      },
      greyscale: {
        backgroundColor: 'transparent',
        color: 'greyscale.400',
        '&[data-hovered]': {
          color: 'greyscale.800',
        },
        '&[data-pressed]': {
          color: 'greyscale.800',
        },
        '&[data-selected]': {
          color: 'greyscale.800',
        },
        '&[data-disabled]': {
          color: 'greyscale.200',
        },
      },
      danger: {
        backgroundColor: 'error.400',
        color: 'white',
        '&[data-hovered]': {
          backgroundColor: 'error.600',
        },
        '&[data-pressed]': {
          backgroundColor: 'error.700',
          color: 'error.200',
        },
      },
      error2: {
        backgroundColor: 'error.200',
        color: 'error.900',
        '&[data-hovered]': {
          backgroundColor: 'error.300',
        },
        '&[data-focused]': {
          backgroundColor: 'error.200',
        },
        '&[data-pressed]': {
          backgroundColor: 'error.900',
          color: 'error.100',
        },
        '&[data-selected]': {
          backgroundColor: 'error.900 !important',
          color: 'error.100 !important',
        },
        '&[data-disabled]': {
          backgroundColor: 'error.200',
          color: 'error.300',
        },
      },
      // @TODO: better handling of colors… this is a mess
      success: {
        colorPalette: 'success',
        color: 'success.subtle-text',
        backgroundColor: 'success.subtle',
        '&[data-hovered]': {
          backgroundColor: 'success.200',
        },
        '&[data-pressed]': {
          backgroundColor: 'success.subtle!',
        },
      },
      text: {
        color: 'primary',
        '&[data-hovered]': {
          background: 'gray.100 !important',
          color: 'primary !important',
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
        '&[data-disabled]': {
          color: 'gray.300',
        },
      },
    },
    fullWidth: {
      true: {
        width: 'full',
      },
    },
    // some toggle buttons make more sense without a "pushed button" style when selected because their content changes to mark the state
    shySelected: {
      true: {},
    },
    description: {
      true: {
        flexDirection: 'column',
        gap: '0.5rem',
        '& span': {
          fontSize: '13px',
          textAlign: 'center',
        },
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
  },
  compoundVariants: [
    {
      variant: 'primaryDark',
      shySelected: true,
      css: {
        '&[data-selected]': {
          backgroundColor: 'primaryDark.100',
          color: 'white',
        },
      },
    },
  ],
  defaultVariants: {
    size: 'default',
    variant: 'primary',
  },
})

export type ButtonRecipe = typeof buttonRecipe

export type ButtonRecipeProps = RecipeVariantProps<ButtonRecipe>
