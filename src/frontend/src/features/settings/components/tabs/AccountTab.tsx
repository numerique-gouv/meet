import { A, Badge, Button, DialogProps, Field, H, P } from '@/primitives'
import { Trans, useTranslation } from 'react-i18next'
import {
  usePersistentUserChoices,
  useRoomContext,
} from '@livekit/components-react'
import { authUrl, logoutUrl, useUser } from '@/features/auth'
import { css } from '@/styled-system/css'
import { TabPanel, TabPanelProps } from '@/primitives/Tabs'
import { HStack } from '@/styled-system/jsx'
import { useState } from 'react'

export type AccountTabProps = Pick<DialogProps, 'onOpenChange'> &
  Pick<TabPanelProps, 'id'>

export const AccountTab = ({ id, onOpenChange }: AccountTabProps) => {
  const { t } = useTranslation('settings')
  const { saveUsername } = usePersistentUserChoices()
  const room = useRoomContext()
  const { user, isLoggedIn } = useUser()
  const [name, setName] = useState(room?.localParticipant.name || '')

  const handleOnSubmit = () => {
    if (room) room.localParticipant.setName(name)
    saveUsername(name)
    if (onOpenChange) onOpenChange(false)
  }
  const handleOnCancel = () => {
    if (onOpenChange) onOpenChange(false)
  }

  return (
    <TabPanel padding={'md'} flex id={id}>
      <H lvl={2}>{t('account.heading')}</H>
      <Field
        type="text"
        label={t('account.nameLabel')}
        value={name}
        onChange={setName}
        validate={(value) => {
          return !value ? <p>{'Votre Nom ne peut pas être vide'}</p> : null
        }}
      />
      <H lvl={2}>{t('account.authentication')}</H>
      {isLoggedIn ? (
        <>
          <P>
            <Trans
              i18nKey="settings:account.currentlyLoggedAs"
              values={{ user: user?.email }}
              components={[<Badge />]}
            />
          </P>
          <P>
            <A href={logoutUrl()}>{t('logout', { ns: 'global' })}</A>
          </P>
        </>
      ) : (
        <>
          <P>{t('account.youAreNotLoggedIn')}</P>
          <P>
            <A href={authUrl()}>{t('login', { ns: 'global' })}</A>
          </P>
        </>
      )}
      <HStack
        className={css({
          marginTop: 'auto',
          marginLeft: 'auto',
        })}
      >
        <Button onPress={handleOnCancel}>
          {t('cancel', { ns: 'global' })}
        </Button>
        <Button variant={'primary'} onPress={handleOnSubmit}>
          {t('submit', { ns: 'global' })}
        </Button>
      </HStack>
    </TabPanel>
  )
}
