import { cva } from '@/styled-system/css'

const loader = cva({
  base: {
    borderRadius: '50%',
    position: 'relative',
    animation: 'rotate 1s linear infinite',
    '&:before, &:after': {
      content: '""',
      boxSizing: 'border-box',
      position: 'absolute',
      inset: '0',
      borderRadius: '50%',
      borderStyle: 'solid',
      borderColor: 'white',
    },
    _before: {
      animation: 'prixClipFix 2s linear infinite',
    },
    _after: {
      borderColor: 'white',
      animation:
        'prixClipFix 2s linear infinite, rotate 0.5s linear infinite reverse',
      inset: 6,
    },
  },
  variants: {
    size: {
      small: {
        width: '24px',
        height: '24px',
        '&:before, &:after': {
          borderWidth: '2px',
        },
      },
    },
  },
  defaultVariants: {
    size: 'small',
  },
})

export const Loader = () => {
  return <div className={loader()}></div>
}
