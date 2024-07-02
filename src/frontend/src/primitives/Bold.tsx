import { css } from '@/styled-system/css'

const bold = css({
  fontWeight: 'bold',
})

export const Bold = (props: React.HTMLAttributes<HTMLSpanElement>) => {
  return <strong className={bold} {...props} />
}
