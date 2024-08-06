import { ReactNode } from 'react'
import { Menu, MenuProps, MenuItem } from 'react-aria-components'
import { menuItemRecipe } from './menuItemRecipe'

/**
 * render a Button primitive that shows a popover showing a list of pressable items
 */
export const MenuList = <T extends string | number = string>({
  onAction,
  selectedItem,
  items = [],
  ...menuProps
}: {
  onAction: (key: T) => void
  selectedItem?: T
  items: Array<string | { value: T; label: ReactNode }>
} & MenuProps<unknown>) => {
  return (
    <Menu
      selectionMode={selectedItem !== undefined ? 'single' : undefined}
      selectedKeys={selectedItem !== undefined ? [selectedItem] : undefined}
      {...menuProps}
    >
      {items.map((item) => {
        const value = typeof item === 'string' ? item : item.value
        const label = typeof item === 'string' ? item : item.label
        return (
          <MenuItem
            className={menuItemRecipe()}
            key={value}
            id={value as string}
            onAction={() => {
              onAction(value as T)
            }}
          >
            {label}
          </MenuItem>
        )
      })}
    </Menu>
  )
}
