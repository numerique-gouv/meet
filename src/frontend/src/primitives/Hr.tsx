import { css } from '@/styled-system/css'

const hr = css({
  marginY: '1',
  borderColor: 'neutral.300',
})

export const Hr = (props: React.HTMLAttributes<HTMLHRElement>) => {
  return <hr className={hr} {...props} />
}
