import { ReactNode } from 'react'
import { MenuTrigger } from 'react-aria-components'
import { StyledPopover } from './Popover'
import { Box } from './Box'

/**
 * a Menu is a tuple of a trigger component (most usually a Button) that toggles menu items in a tooltip around the trigger
 */
export const Menu = ({
  children,
  variant = 'light',
}: {
  children: [trigger: ReactNode, menu: ReactNode]
  variant?: 'dark' | 'light'
}) => {
  const [trigger, menu] = children
  return (
    <MenuTrigger>
      {trigger}
      <StyledPopover>
        <Box size="sm" type="popover" variant={variant}>
          {menu}
        </Box>
      </StyledPopover>
    </MenuTrigger>
  )
}
