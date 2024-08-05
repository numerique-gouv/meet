import {
  Button as RACButton,
  type ButtonProps as RACButtonsProps,
  Link,
  LinkProps,
} from 'react-aria-components'
import { type RecipeVariantProps } from '@/styled-system/css'
import { buttonRecipe, type ButtonRecipe } from './buttonRecipe'
import { TooltipWrapper, type TooltipWrapperProps } from './TooltipWrapper'

export type ButtonProps = RecipeVariantProps<ButtonRecipe> &
  RACButtonsProps &
  TooltipWrapperProps

type LinkButtonProps = RecipeVariantProps<ButtonRecipe> &
  LinkProps &
  TooltipWrapperProps

type ButtonOrLinkProps = ButtonProps | LinkButtonProps

export const Button = ({
  tooltip,
  tooltipType = 'instant',
  ...props
}: ButtonOrLinkProps) => {
  const [variantProps, componentProps] = buttonRecipe.splitVariantProps(props)
  if ((props as LinkButtonProps).href !== undefined) {
    return (
      <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
        <Link className={buttonRecipe(variantProps)} {...componentProps} />
      </TooltipWrapper>
    )
  }

  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <RACButton
        className={buttonRecipe(variantProps)}
        {...(componentProps as RACButtonsProps)}
      />
    </TooltipWrapper>
  )
}
