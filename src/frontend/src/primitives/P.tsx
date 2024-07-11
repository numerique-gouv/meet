import { Text, type As } from './Text'

export const P = (props: React.HTMLAttributes<HTMLElement> & As) => {
  return <Text as="p" variant="paragraph" {...props} />
}
