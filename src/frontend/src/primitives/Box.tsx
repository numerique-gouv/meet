import { cva } from '@/styled-system/css'
import { styled } from '../styled-system/jsx'

const box = cva({
  base: {
    gap: 'gutter',
    borderRadius: 8,
    padding: 'boxPadding',
    flex: 1,
  },
  variants: {
    asScreen: {
      true: {
        margin: 'auto',
        width: '38rem',
        maxWidth: '100%',
        marginTop: '6rem',
        textAlign: 'center',
      },
    },
    variant: {
      default: {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'box.border',
        backgroundColor: 'box.bg',
        color: 'box.text',
        boxShadow: 'box',
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
    asScreen: false,
    variant: 'default',
    size: 'default',
  },
})

export const Box = styled('div', box)
