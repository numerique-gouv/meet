import {
  Button as RACButton,
  type ButtonProps as RACButtonsProps,
} from 'react-aria-components'

export const Button = (props: RACButtonsProps) => {
  return <RACButton {...props} className="lk-button" />
}
