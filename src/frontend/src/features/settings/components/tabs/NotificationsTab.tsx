import { TabPanel, TabPanelProps } from '@/primitives/Tabs'
import { H, Switch } from '@/primitives'
import { css } from '@/styled-system/css'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { notificationsStore } from '@/stores/notifications'

export type NotificationsTabProps = Pick<TabPanelProps, 'id'>

export const NotificationsTab = ({ id }: NotificationsTabProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'notifications' })
  const notificationsSnap = useSnapshot(notificationsStore)
  return (
    <TabPanel padding={'md'} flex id={id}>
      <H lvl={2}>{t('heading')}</H>
      <ul
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        })}
      >
        {Array.from(notificationsSnap.soundNotifications).map(
          ([key, value]) => (
            <li key={key}>
              <Switch
                aria-label={`${t(`actions.${value ? 'disable' : 'enable'}`)} ${t('label')} "${t(`items.${key}`)}"`}
                isSelected={value}
                onChange={(v) => {
                  notificationsStore.soundNotifications.set(key, v)
                }}
              >
                {t(`items.${key}`)}
              </Switch>
            </li>
          )
        )}
      </ul>
    </TabPanel>
  )
}
