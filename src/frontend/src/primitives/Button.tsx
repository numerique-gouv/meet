import {
  Button as RACButton,
  type ButtonProps as RACButtonsProps,
} from 'react-aria-components'
import { type RecipeVariantProps } from '@/styled-system/css'
import { buttonRecipe, type ButtonRecipe } from './buttonRecipe'
import { TooltipWrapper, type TooltipWrapperProps } from './TooltipWrapper'

export type ButtonProps = RecipeVariantProps<ButtonRecipe> &
  RACButtonsProps &
  TooltipWrapperProps

export const Button = ({
  tooltip,
  tooltipType = 'instant',
  ...props
}: ButtonProps) => {
  const [variantProps, componentProps] = buttonRecipe.splitVariantProps(props)

  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <RACButton
        className={buttonRecipe(variantProps)}
        {...(componentProps as RACButtonsProps)}
      />
    </TooltipWrapper>
  )
}
