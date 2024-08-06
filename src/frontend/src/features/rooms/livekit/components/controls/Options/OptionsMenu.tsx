import { useTranslation } from 'react-i18next'
import {
  RiFeedbackLine,
  RiQuestionLine,
  RiSettings3Line,
} from '@remixicon/react'
import { styled } from '@/styled-system/jsx'
import {
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  Popover as RACPopover,
} from 'react-aria-components'

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

export const OptionsMenu = () => {
  const { t } = useTranslation('rooms')

  return (
    <StyledPopover>
      <StyledMenu>
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
        <StyledMenuItem onAction={() => alert('delete')}>
          <RiSettings3Line size={18} />
          {t('options.items.settings')}
        </StyledMenuItem>
      </StyledMenu>
    </StyledPopover>
  )
}
