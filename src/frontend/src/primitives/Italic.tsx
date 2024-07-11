import { Text, type As } from './Text'

export const Italic = (props: React.HTMLAttributes<HTMLElement> & As) => {
  return <Text as="em" {...props} italic />
}
