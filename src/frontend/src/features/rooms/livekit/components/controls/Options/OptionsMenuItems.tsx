import {
  RiAccountBoxLine,
  RiMegaphoneLine,
  RiSettings3Line,
} from '@remixicon/react'
import { MenuItem, Menu as RACMenu, Section } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Dispatch, SetStateAction } from 'react'
import { DialogState } from './OptionsButton'
import { Separator } from '@/primitives/Separator'
import { useSidePanel } from '../../../hooks/useSidePanel'
import { menuRecipe } from '@/primitives/menuRecipe.ts'
import { TranscriptMenuItem } from './TranscriptMenuItem'

// @todo try refactoring it to use MenuList component
export const OptionsMenuItems = ({
  onOpenDialog,
}: {
  onOpenDialog: Dispatch<SetStateAction<DialogState>>
}) => {
  const { t } = useTranslation('rooms', { keyPrefix: 'options.items' })
  const { toggleEffects } = useSidePanel()
  return (
    <RACMenu
      style={{
        minWidth: '150px',
        width: '300px',
      }}
    >
      <Section>
        <MenuItem
          onAction={() => toggleEffects()}
          className={menuRecipe({ icon: true }).item}
        >
          <RiAccountBoxLine size={20} />
          {t('effects')}
        </MenuItem>
        <TranscriptMenuItem />
      </Section>
      <Separator />
      <Section>
        <MenuItem
          href="https://grist.incubateur.net/o/docs/forms/1YrfNP1QSSy8p2gCxMFnSf/4"
          target="_blank"
          className={menuRecipe({ icon: true }).item}
        >
          <RiMegaphoneLine size={20} />
          {t('feedbacks')}
        </MenuItem>
        <MenuItem
          className={menuRecipe({ icon: true }).item}
          onAction={() => onOpenDialog('settings')}
        >
          <RiSettings3Line size={20} />
          {t('settings')}
        </MenuItem>
      </Section>
    </RACMenu>
  )
}
