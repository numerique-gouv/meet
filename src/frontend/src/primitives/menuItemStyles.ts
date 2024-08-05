/**
 * reusable styles for a menu item, select item, etc… to be used with panda `css()` or `styled()`
 *
 * these are in their own files because react hot refresh doesn't like exporting stuff
 * that aren't components in component files
 */
export const menuItemStyles = {
  base: {
    paddingY: 0.125,
    paddingX: 0.5,
    textAlign: 'left',
    width: 'full',
    borderRadius: 4,
    cursor: 'pointer',
    color: 'box.text',
    border: '1px solid transparent',
    '&[data-selected]': {
      fontWeight: 'bold!',
    },
    '&[data-focused]': {
      color: 'primary.text',
      backgroundColor: 'primary',
      outline: 'none!',
    },
    '&[data-hovered]': {
      color: 'primary.text',
      backgroundColor: 'primary',
      outline: 'none!',
    },
  },
}
