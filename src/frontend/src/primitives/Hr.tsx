import { css } from '@/styled-system/css'

export const Hr = (props: React.HTMLAttributes<HTMLHRElement>) => {
  return (
    <hr
      className={css({
        marginY: 1,
        borderColor: 'neutral.300',
      })}
      {...props}
    />
  )
}
