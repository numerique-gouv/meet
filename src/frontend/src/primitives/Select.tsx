import { type ReactNode } from 'react'
import { styled } from '@/styled-system/jsx'
import { RiArrowDropDownLine } from '@remixicon/react'
import {
  Button,
  ListBox,
  ListBoxItem,
  Select as RACSelect,
  SelectProps,
  SelectValue,
} from 'react-aria-components'
import { Box } from './Box'
import { StyledPopover } from './Popover'
import { menuItemRecipe } from './menuItemRecipe'

const StyledButton = styled(Button, {
  base: {
    width: 'full',
    display: 'flex',
    justifyContent: 'space-between',
    paddingY: 0.125,
    paddingX: 0.25,
    border: '1px solid',
    borderColor: 'control.border',
    color: 'control.text',
    borderRadius: 4,
    boxShadow: '0 1px 2px rgba(0 0 0 / 0.1)',
    '&[data-focus-visible]': {
      outline: '2px solid {colors.focusRing}',
      outlineOffset: '-1px',
    },
    '&[data-pressed]': {
      backgroundColor: 'control.hover',
    },
    // fixme disabled style is being overridden by placeholder one and needs refinement.
    '&[data-disabled]': {
      color: 'default.subtle-text',
      borderColor: 'gray.200',
      boxShadow: '0 1px 2px rgba(0 0 0 / 0.02)',
    },
  },
})

const StyledSelectValue = styled(SelectValue, {
  base: {
    '&[data-placeholder]': {
      color: 'default.subtle-text',
      fontStyle: 'italic',
    },
  },
})

export const Select = <T extends string | number>({
  label,
  items,
  errors,
  ...props
}: Omit<SelectProps<object>, 'items' | 'label' | 'errors'> & {
  label: ReactNode
  items: Array<{ value: T; label: ReactNode }>
  errors?: ReactNode
}) => {
  return (
    <RACSelect {...props}>
      {label}
      <StyledButton>
        <StyledSelectValue />
        <RiArrowDropDownLine aria-hidden="true" />
      </StyledButton>
      <StyledPopover>
        <Box size="sm" type="popover" variant="control">
          <ListBox>
            {items.map((item) => (
              <ListBoxItem
                className={menuItemRecipe()}
                id={item.value}
                key={item.value}
              >
                {item.label}
              </ListBoxItem>
            ))}
          </ListBox>
        </Box>
      </StyledPopover>
      {errors}
    </RACSelect>
  )
}
