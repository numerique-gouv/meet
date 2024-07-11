import { Text, type As } from './Text'

export const Bold = (props: React.HTMLAttributes<HTMLElement> & As) => {
  return <Text as="strong" {...props} bold />
}
