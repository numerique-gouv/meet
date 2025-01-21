import {
  RiAccountBoxLine,
  RiFullscreenExitLine,
  RiFullscreenLine,
  RiMegaphoneLine,
  RiSettings3Line,
} from '@remixicon/react'
import { MenuItem, Menu as RACMenu, MenuSection } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/primitives/Separator'
import { useSidePanel } from '../../../hooks/useSidePanel'
import { menuRecipe } from '@/primitives/menuRecipe.ts'
import { useSettingsDialog } from '../SettingsDialogContext'
import { GRIST_FORM } from '@/utils/constants'
import { useFullScreen } from '../../../hooks/useFullScreen'

// @todo try refactoring it to use MenuList component
export const OptionsMenuItems = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'options.items' })
  const { toggleEffects } = useSidePanel()
  const { setDialogOpen } = useSettingsDialog()

  const { toggleFullScreen, isCurrentlyFullscreen, isFullscreenAvailable } =
    useFullScreen()

  return (
    <RACMenu
      style={{
        minWidth: '150px',
        width: '300px',
      }}
    >
      <MenuSection>
        {isFullscreenAvailable && (
          <MenuItem
            onAction={() => toggleFullScreen()}
            className={menuRecipe({ icon: true, variant: 'dark' }).item}
          >
            {isCurrentlyFullscreen ? (
              <>
                <RiFullscreenExitLine size={20} />
                {t('fullscreen.exit')}
              </>
            ) : (
              <>
                <RiFullscreenLine size={20} />
                {t('fullscreen.enter')}
              </>
            )}
          </MenuItem>
        )}
        <MenuItem
          onAction={() => toggleEffects()}
          className={menuRecipe({ icon: true, variant: 'dark' }).item}
        >
          <RiAccountBoxLine size={20} />
          {t('effects')}
        </MenuItem>
      </MenuSection>
      <Separator />
      <MenuSection>
        <MenuItem
          href={GRIST_FORM}
          target="_blank"
          className={menuRecipe({ icon: true, variant: 'dark' }).item}
        >
          <RiMegaphoneLine size={20} />
          {t('feedback')}
        </MenuItem>
        <MenuItem
          className={menuRecipe({ icon: true, variant: 'dark' }).item}
          onAction={() => setDialogOpen(true)}
        >
          <RiSettings3Line size={20} />
          {t('settings')}
        </MenuItem>
      </MenuSection>
    </RACMenu>
  )
}
