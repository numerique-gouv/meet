import {
  ToggleButton as RACToggleButton,
  ToggleButtonProps as RACToggleButtonProps,
} from 'react-aria-components'
import { type ButtonRecipeProps, buttonRecipe } from './buttonRecipe'
import { TooltipWrapper, TooltipWrapperProps } from './TooltipWrapper'
import { ReactNode } from 'react'

export type ToggleButtonProps = RACToggleButtonProps &
  ButtonRecipeProps &
  TooltipWrapperProps & {
    // Use tooltip as description below the button.
    description?: boolean
  }

/**
 * React aria ToggleButton with our button styles, that can take a tooltip if needed
 */
export const ToggleButton = ({
  tooltip,
  tooltipType,
  ...props
}: ToggleButtonProps) => {
  const [variantProps, componentProps] = buttonRecipe.splitVariantProps(props)

  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <RACToggleButton
        {...componentProps}
        className={buttonRecipe(variantProps)}
      >
        <>
          {componentProps.children as ReactNode}
          {props.description && <span>{tooltip}</span>}
        </>
      </RACToggleButton>
    </TooltipWrapper>
  )
}
