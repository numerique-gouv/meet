import { cva } from '@/styled-system/css'
import { styled } from '../styled-system/jsx'

const box = cva({
  base: {
    position: 'relative',
    gap: 'gutter',
    borderRadius: 8,
    padding: 'boxPadding',
    flex: 1,
  },
  variants: {
    type: {
      screen: {
        margin: 'auto',
        width: '38rem',
        maxWidth: '100%',
        textAlign: 'center',
      },
      popover: {
        padding: 'boxPadding.xs',
        minWidth: '10rem',
      },
      dialog: {
        width: '30rem',
        maxWidth: '100%',
      },
    },
    variant: {
      default: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'box.border',
        backgroundColor: 'box.bg',
        color: 'box.text',
      },
      subtle: {
        color: 'default.subtle-text',
        backgroundColor: 'default.subtle',
      },
    },
    size: {
      default: {
        padding: 'boxPadding',
      },
      sm: {
        padding: 'boxPadding.sm',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export const Box = styled('div', box)
