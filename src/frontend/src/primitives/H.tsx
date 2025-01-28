import { Text, TextProps } from './Text'

export const H = ({
  children,
  lvl,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  lvl: 1 | 2 | 3
} & TextProps) => {
  const tag = `h${lvl}` as const
  return (
    <Text as={tag} variant={tag} {...props}>
      {children}
    </Text>
  )
}
