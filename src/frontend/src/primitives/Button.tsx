import {
  Button as RACButton,
  type ButtonProps as RACButtonsProps,
} from 'react-aria-components'
import { type RecipeVariantProps } from '@/styled-system/css'
import { buttonRecipe, type ButtonRecipe } from './buttonRecipe'
import { TooltipWrapper, type TooltipWrapperProps } from './TooltipWrapper'
import { ReactNode } from 'react'

export type ButtonProps = RecipeVariantProps<ButtonRecipe> &
  RACButtonsProps &
  TooltipWrapperProps & {
    // Use tooltip as description below the button.
    description?: boolean
  }

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
      >
        {componentProps.children as ReactNode}
        {props.description && <span>{tooltip}</span>}
      </RACButton>
    </TooltipWrapper>
  )
}
