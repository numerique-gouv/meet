import { useSnapshot } from 'valtio'
import { layoutStore } from '@/stores/layout'
import { css } from '@/styled-system/css'
import { Heading } from 'react-aria-components'
import { text } from '@/primitives/Text'
import { Box, Button, Div } from '@/primitives'
import { RiCloseLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import { ParticipantsList } from './controls/Participants/ParticipantsList'
import { useWidgetInteraction } from '../hooks/useWidgetInteraction'
import { ReactNode } from 'react'

type StyledSidePanelProps = {
  title: string
  children: ReactNode
  onClose: () => void
  closeButtonTooltip: string
}

const StyledSidePanel = ({
  title,
  children,
  onClose,
  closeButtonTooltip,
}: StyledSidePanelProps) => (
  <Box
    size="sm"
    minWidth="360px"
    className={css({
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      margin: '1.5rem 1.5rem 1.5rem 0',
      padding: 0,
      gap: 0,
    })}
  >
    <Heading
      slot="title"
      level={1}
      className={text({ variant: 'h2' })}
      style={{
        paddingLeft: '1.5rem',
        paddingTop: '1rem',
      }}
    >
      {title}
    </Heading>
    <Div position="absolute" top="5" right="5">
      <Button
        invisible
        size="xs"
        onPress={onClose}
        aria-label={closeButtonTooltip}
        tooltip={closeButtonTooltip}
      >
        <RiCloseLine />
      </Button>
    </Div>
    <Div overflowY="scroll">{children}</Div>
  </Box>
)

export const SidePanel = () => {
  const layoutSnap = useSnapshot(layoutStore)
  const sidePanel = layoutSnap.sidePanel

  const { isParticipantsOpen } = useWidgetInteraction()
  const { t } = useTranslation('rooms', { keyPrefix: 'sidePanel' })

  if (!sidePanel) {
    return
  }

  return (
    <StyledSidePanel
      title={t(`heading.${sidePanel}`)}
      onClose={() => (layoutStore.sidePanel = null)}
      closeButtonTooltip={t('closeButton', {
        content: t(`content.${sidePanel}`),
      })}
    >
      {isParticipantsOpen && <ParticipantsList />}
    </StyledSidePanel>
  )
}
