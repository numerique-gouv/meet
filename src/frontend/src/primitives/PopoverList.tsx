import { ReactNode, useContext } from 'react'
import {
  ButtonProps,
  Button,
  OverlayTriggerStateContext,
} from 'react-aria-components'
import { styled } from '@/styled-system/jsx'

const ListItem = styled(Button, {
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
    '&[data-hovered]': {
      color: 'primary.text',
      backgroundColor: 'primary',
      outline: 'none!',
    },
  },
})

/**
 * render a Button primitive that shows a popover showing a list of pressable items
 */
export const PopoverList = <T extends string | number = string>({
  onAction,
  closeOnAction = true,
  items = [],
}: {
  closeOnAction?: boolean
  onAction: (key: T) => void
  items: Array<string | { key: string; value: T; label: ReactNode }>
} & ButtonProps) => {
  const popoverState = useContext(OverlayTriggerStateContext)!
  return (
    <ul>
      {items.map((item) => {
        const value = typeof item === 'string' ? item : item.value
        const label = typeof item === 'string' ? item : item.label
        const key = typeof item === 'string' ? item : item.key
        return (
          <li key={key}>
            <ListItem
              key={value}
              onPress={() => {
                onAction(value as T)
                if (closeOnAction) {
                  popoverState.close()
                }
              }}
            >
              {label}
            </ListItem>
          </li>
        )
      })}
    </ul>
  )
}
