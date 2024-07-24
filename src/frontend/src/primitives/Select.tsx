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

const StyledListBoxItem = styled(ListBoxItem, {
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
      fontWeight: 'bold',
    },
    '&[data-focused]': {
      color: 'primary.text',
      backgroundColor: 'primary',
      outline: 'none!',
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
              <StyledListBoxItem id={item.value} key={item.value}>
                {item.label}
              </StyledListBoxItem>
            ))}
          </ListBox>
        </Box>
      </StyledPopover>
      {errors}
    </RACSelect>
  )
}
