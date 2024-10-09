import { Link, LinkProps } from 'react-aria-components'
import { type RecipeVariantProps } from '@/styled-system/css'
import { buttonRecipe, type ButtonRecipe } from './buttonRecipe'
import { TooltipWrapper, type TooltipWrapperProps } from './TooltipWrapper'

type LinkButtonProps = RecipeVariantProps<ButtonRecipe> &
  LinkProps &
  TooltipWrapperProps

export const LinkButton = ({
  tooltip,
  tooltipType = 'instant',
  ...props
}: LinkButtonProps) => {
  const [variantProps, componentProps] = buttonRecipe.splitVariantProps(props)

  return (
    <TooltipWrapper tooltip={tooltip} tooltipType={tooltipType}>
      <Link className={buttonRecipe(variantProps)} {...componentProps} />
    </TooltipWrapper>
  )
}
