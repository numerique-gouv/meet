import { menuItemRecipe } from '@/primitives/menuItemRecipe'
import {
  RiFeedbackLine,
  RiQuestionLine,
  RiSettings3Line,
  RiUser5Line,
} from '@remixicon/react'
import { styled } from '@/styled-system/jsx'
import {
  MenuItem,
  Menu as RACMenu,
  Separator as RACSeparator,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Dispatch, SetStateAction } from 'react'
import { DialogState } from '@/features/rooms/livekit/components/controls/Options/OptionsButton'

const StyledSeparator = styled(RACSeparator, {
  base: {
    height: '1px',
    background: 'gray.300',
    margin: '4px 0',
  },
})

// @todo try refactoring it to use MenuList component
export const OptionsMenuItems = ({
  onOpenDialog,
}: {
  onOpenDialog: Dispatch<SetStateAction<DialogState>>
}) => {
  const { t } = useTranslation('rooms')

  return (
    <RACMenu
      style={{
        minWidth: '150px',
        width: '300px',
      }}
    >
      <MenuItem
        className={menuItemRecipe({ icon: true })}
        onAction={() => onOpenDialog('username')}
      >
        <RiUser5Line size={18} />
        {t('options.items.username')}
      </MenuItem>
      <StyledSeparator />
      <MenuItem
        href="https://tchap.gouv.fr/#/room/!aGImQayAgBLjSBycpm:agent.dinum.tchap.gouv.fr?via=agent.dinum.tchap.gouv.fr"
        target="_blank"
        className={menuItemRecipe({ icon: true })}
      >
        <RiQuestionLine size={18} />
        {t('options.items.support')}
      </MenuItem>
      <MenuItem
        href="https://grist.incubateur.net/o/docs/forms/1YrfNP1QSSy8p2gCxMFnSf/4"
        target="_blank"
        className={menuItemRecipe({ icon: true })}
      >
        <RiFeedbackLine size={18} />
        {t('options.items.feedbacks')}
      </MenuItem>
      <MenuItem
        className={menuItemRecipe({ icon: true })}
        onAction={() => onOpenDialog('settings')}
      >
        <RiSettings3Line size={18} />
        {t('options.items.settings')}
      </MenuItem>
    </RACMenu>
  )
}
