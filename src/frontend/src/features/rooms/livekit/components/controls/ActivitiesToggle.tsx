import { useTranslation } from 'react-i18next'
import { RiShapesLine } from '@remixicon/react'
import { css } from '@/styled-system/css'
import { ToggleButton } from '@/primitives'
import { useSidePanel } from '../../hooks/useSidePanel'

export const ActivitiesToggle = () => {
  const { t } = useTranslation('rooms', { keyPrefix: 'controls.chat' })

  const { isActivitiesOpen, toggleActivities } = useSidePanel()
  const tooltipLabel = isActivitiesOpen ? 'open' : 'closed'

  return (
    <div
      className={css({
        position: 'relative',
        display: 'inline-block',
      })}
    >
      <ToggleButton
        square
        variant="primaryTextDark"
        aria-label={t(tooltipLabel)}
        tooltip={t(tooltipLabel)}
        isSelected={isActivitiesOpen}
        onPress={() => toggleActivities()}
        data-attr={`controls-chat-${tooltipLabel}`}
      >
        <RiShapesLine />
      </ToggleButton>
    </div>
  )
}
