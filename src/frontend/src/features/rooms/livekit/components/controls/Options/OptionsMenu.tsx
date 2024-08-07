import { useTranslation } from 'react-i18next'
import {
  RiFeedbackLine,
  RiQuestionLine,
  RiSettings3Line,
  RiUser5Line,
} from '@remixicon/react'
import { useState } from 'react'
import { styled } from '@/styled-system/jsx'
import {
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  Popover as RACPopover,
  Separator as RACSeparator,
} from 'react-aria-components'
import { SettingsDialog } from '@/features/settings'
import { UsernameDialog } from '../../dialogs/UsernameDialog'

// Styled components to be refactored
const StyledMenu = styled(RACMenu, {
  base: {
    maxHeight: 'inherit',
    boxSizing: 'border-box',
    overflow: 'auto',
    padding: '2px',
    minWidth: '150px',
    outline: 'none',
  },
})

const StyledMenuItem = styled(RACMenuItem, {
  base: {
    margin: '2px',
    padding: '0.286rem 0.571rem',
    borderRadius: '6px',
    outline: 'none',
    cursor: 'default',
    color: 'black',
    fontSize: '1.072rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    forcedColorAdjust: 'none',
    '&[data-focused]': {
      color: 'primary.text',
      backgroundColor: 'primary',
      outline: 'none!',
    },
  },
})

const StyledPopover = styled(RACPopover, {
  base: {
    border: '1px solid #9ca3af',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    background: 'white',
    color: 'var(--text-color)',
    outline: 'none',
    minWidth: '112px',
    width: '300px',
  },
})

const StyledSeparator = styled(RACSeparator, {
  base: {
    height: '1px',
    background: '#9ca3af',
    margin: '2px 4px',
  },
})

type DialogState = 'username' | 'settings' | null

export const OptionsMenu = () => {
  const { t } = useTranslation('rooms')
  const [dialogOpen, setDialogOpen] = useState<DialogState>(null)
  return (
    <>
      <StyledPopover>
        <StyledMenu>
          <StyledMenuItem onAction={() => setDialogOpen('username')}>
            <RiUser5Line size={18} />
            {t('options.items.username')}
          </StyledMenuItem>
          <StyledSeparator />
          <StyledMenuItem
            href="https://tchap.gouv.fr/#/room/!aGImQayAgBLjSBycpm:agent.dinum.tchap.gouv.fr?via=agent.dinum.tchap.gouv.fr"
            target="_blank"
          >
            <RiQuestionLine size={18} />
            {t('options.items.support')}
          </StyledMenuItem>
          <StyledMenuItem
            href="https://grist.incubateur.net/o/docs/forms/1YrfNP1QSSy8p2gCxMFnSf/4"
            target="_blank"
          >
            <RiFeedbackLine size={18} />
            {t('options.items.feedbacks')}
          </StyledMenuItem>
          <StyledMenuItem onAction={() => setDialogOpen('settings')}>
            <RiSettings3Line size={18} />
            {t('options.items.settings')}
          </StyledMenuItem>
        </StyledMenu>
      </StyledPopover>
      <UsernameDialog
        isOpen={dialogOpen === 'username'}
        onOpenChange={(v) => !v && setDialogOpen(null)}
      />
      <SettingsDialog
        isOpen={dialogOpen === 'settings'}
        onOpenChange={(v) => !v && setDialogOpen(null)}
      />
    </>
  )
}
