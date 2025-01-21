import { sva } from '@/styled-system/css'

export const menuRecipe = sva({
  slots: ['root', 'item'],
  base: {
    root: {},
    item: {
      paddingY: 0.125,
      paddingX: 0.5,
      textAlign: 'left',
      width: 'full',
      borderRadius: 4,
      cursor: 'pointer',
      color: 'box.text',
      border: '1px solid transparent',
      position: 'relative',
      '&[data-selected]': {
        '&::before': {
          content: '"✓"',
          position: 'absolute',
          top: '2px',
          left: '6px',
        },
      },
      '&[data-focused]': {
        color: 'primary.text',
        backgroundColor: 'primaryDark.100',
        outline: 'none!',
      },
      '&[data-hovered]': {
        color: 'primary.text',
        backgroundColor: 'primaryDark.100',
        outline: 'none!',
      },
    },
  },
  variants: {
    variant: {
      light: {
        item: {
          '&[data-focused]': {
            backgroundColor: 'primary.800',
          },
          '&[data-hovered]': {
            backgroundColor: 'primary.800',
          },
        },
      },
      dark: {
        item: {
          color: 'white',
        },
      },
    },
    extraPadding: {
      true: {
        item: {
          paddingLeft: 1.5,
        },
      },
    },
    icon: {
      true: {
        item: {
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          paddingY: '0.4rem',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'light',
  },
})
