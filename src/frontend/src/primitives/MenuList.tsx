import { ReactNode } from 'react'
import { Menu, MenuProps, MenuItem } from 'react-aria-components'
import { menuRecipe } from '@/primitives/menuRecipe.ts'
import type { RecipeVariantProps } from '@/styled-system/types'

/**
 * render a Button primitive that shows a popover showing a list of pressable items
 */
export const MenuList = <T extends string | number = string>({
  onAction,
  selectedItem,
  items = [],
  variant = 'light',
  ...menuProps
}: {
  onAction: (key: T) => void
  selectedItem?: T
  items: Array<string | { value: T; label: ReactNode }>
} & MenuProps<unknown> &
  RecipeVariantProps<typeof menuRecipe>) => {
  const [variantProps] = menuRecipe.splitVariantProps(menuProps)
  const classes = menuRecipe({
    extraPadding: true,
    variant: variant,
    ...variantProps,
  })
  return (
    <Menu
      selectionMode={selectedItem !== undefined ? 'single' : undefined}
      selectedKeys={selectedItem !== undefined ? [selectedItem] : undefined}
      className={classes.root}
      {...menuProps}
    >
      {items.map((item) => {
        const value = typeof item === 'string' ? item : item.value
        const label = typeof item === 'string' ? item : item.label
        return (
          <MenuItem
            className={classes.item}
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
