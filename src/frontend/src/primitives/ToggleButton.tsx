import {
  ToggleButton as RACToggleButton,
  ToggleButtonProps,
} from 'react-aria-components'
import { type ButtonRecipeProps, buttonRecipe } from './buttonRecipe'
import { TooltipWrapper, TooltipWrapperProps } from './TooltipWrapper'

/**
 * React aria ToggleButton with our button styles, that can take a tooltip if needed
 */
export const ToggleButton = ({
  tooltip,
  tooltipType,
  ...props
}: ToggleButtonProps & ButtonRecipeProps & TooltipWrapperProps) => {
  const [variantProps, componentProps] = buttonRecipe.splitVariantProps(props)
  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <RACToggleButton
        {...componentProps}
        className={buttonRecipe(variantProps)}
      />
    </TooltipWrapper>
  )
}
