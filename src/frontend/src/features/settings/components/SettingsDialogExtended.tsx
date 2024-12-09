import { Dialog, type DialogProps } from '@/primitives'
import { Tab, Tabs, TabList } from '@/primitives/Tabs.tsx'
import { css } from '@/styled-system/css'
import { text } from '@/primitives/Text.tsx'
import { Heading } from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import {
  RiAccountCircleLine,
  RiNotification3Line,
  RiSettings3Line,
  RiSpeakerLine,
} from '@remixicon/react'
import { AccountTab } from './tabs/AccountTab'
import { NotificationsTab } from './tabs/NotificationsTab'
import { GeneralTab } from './tabs/GeneralTab'
import { AudioTab } from './tabs/AudioTab'
import { useSize } from '@/features/rooms/livekit/hooks/useResizeObserver'
import { useRef } from 'react'

const tabsStyle = css({
  maxHeight: '40.625rem', // fixme size copied from meet settings modal
  width: '50rem', // fixme size copied from meet settings modal
  marginY: '-1rem', // fixme hacky solution to cancel modal padding
  maxWidth: '100%',
  overflow: 'hidden',
  height: 'calc(100vh - 2rem)',
})

const tabListContainerStyle = css({
  display: 'flex',
  flexDirection: 'column',
  borderRight: '1px solid lightGray', // fixme poor color management
  paddingY: '1rem',
  paddingRight: '1.5rem',
})

const tabPanelContainerStyle = css({
  display: 'flex',
  flexGrow: '1',
  marginTop: '3.5rem',
  minWidth: 0,
})

export type SettingsDialogExtended = Pick<
  DialogProps,
  'isOpen' | 'onOpenChange'
>

export const SettingsDialogExtended = (props: SettingsDialogExtended) => {
  // display only icon on small screen
  const { t } = useTranslation('settings')

  const dialogEl = useRef<HTMLDivElement>(null)
  const { width } = useSize(dialogEl)
  const isWideScreen = !width || width >= 800 // fixme - hardcoded 50rem in pixel

  return (
    <Dialog innerRef={dialogEl} {...props} role="dialog" type="flex">
      <Tabs orientation="vertical" className={tabsStyle}>
        <div
          className={tabListContainerStyle}
          style={{
            flex: isWideScreen ? '0 0 16rem' : undefined,
            paddingTop: !isWideScreen ? '64px' : undefined,
            paddingRight: !isWideScreen ? '1rem' : undefined,
          }}
        >
          {isWideScreen && (
            <Heading slot="title" level={1} className={text({ variant: 'h1' })}>
              {t('dialog.heading')}
            </Heading>
          )}
          <TabList border={false} aria-label="Chat log orientation example">
            <Tab icon highlight id="1">
              <RiAccountCircleLine />
              {isWideScreen && t('tabs.account')}
            </Tab>
            <Tab icon highlight id="2">
              <RiSpeakerLine />
              {isWideScreen && t('tabs.audio')}
            </Tab>
            <Tab icon highlight id="3">
              <RiSettings3Line />
              {isWideScreen && t('tabs.general')}
            </Tab>
            <Tab icon highlight id="4">
              <RiNotification3Line />
              {isWideScreen && t('tabs.notifications')}
            </Tab>
          </TabList>
        </div>
        <div className={tabPanelContainerStyle}>
          <AccountTab id="1" onOpenChange={props.onOpenChange} />
          <AudioTab id="2" />
          <GeneralTab id="3" />
          <NotificationsTab id="4" />
        </div>
      </Tabs>
    </Dialog>
  )
}
