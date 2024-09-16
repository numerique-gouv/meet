import { menuItemRecipe } from '@/primitives/menuItemRecipe'
import {
  RiFeedbackLine,
  RiQuestionLine,
  RiSettings3Line,
} from '@remixicon/react'
import { MenuItem, Menu as RACMenu } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Dispatch, SetStateAction } from 'react'
import { DialogState } from '@/features/rooms/livekit/components/controls/Options/OptionsButton'

// @todo try refactoring it to use MenuList component
export const OptionsMenuItems = ({
  onOpenDialog,
}: {
  onOpenDialog: Dispatch<SetStateAction<DialogState>>
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'options.items' })

  return (
    <RACMenu
      style={{
        minWidth: '150px',
        width: '300px',
      }}
    >
      <MenuItem
        href="https://tchap.gouv.fr/#/room/!aGImQayAgBLjSBycpm:agent.dinum.tchap.gouv.fr?via=agent.dinum.tchap.gouv.fr"
        target="_blank"
        className={menuItemRecipe({ icon: true })}
      >
        <RiQuestionLine size={18} />
        {t('support')}
      </MenuItem>
      <MenuItem
        href="https://grist.incubateur.net/o/docs/forms/1YrfNP1QSSy8p2gCxMFnSf/4"
        target="_blank"
        className={menuItemRecipe({ icon: true })}
      >
        <RiFeedbackLine size={18} />
        {t('feedbacks')}
      </MenuItem>
      <MenuItem
        className={menuItemRecipe({ icon: true })}
        onAction={() => onOpenDialog('settings')}
      >
        <RiSettings3Line size={18} />
        {t('settings')}
      </MenuItem>
    </RACMenu>
  )
}
