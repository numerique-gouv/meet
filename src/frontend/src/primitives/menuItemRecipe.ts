import { cva } from '@/styled-system/css'

/**
 * reusable styles for a menu item, select item, etc… to be used with panda `css()` or `styled()`
 *
 * these are in their own files because react hot refresh doesn't like exporting stuff
 * that aren't components in component files
 */
export const menuItemRecipe = cva({
  base: {
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
      backgroundColor: 'primaryDark.50',
      outline: 'none!',
    },
    '&[data-hovered]': {
      color: 'primary.text',
      backgroundColor: 'primaryDark.50',
      outline: 'none!',
    },
  },
  variants: {
    icon: {
      true: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        paddingY: '0.4rem',
      },
    },
    extraPadding: {
      true: {
        paddingLeft: 1.5,
      },
    },
  },
})
