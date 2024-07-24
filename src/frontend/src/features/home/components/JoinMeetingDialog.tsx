import { useTranslation } from 'react-i18next'
import { Field, Ul, H, P, Form, Dialog } from '@/primitives'
import { isRoomValid, navigateToRoom } from '@/features/rooms'

export const JoinMeetingDialog = () => {
  const { t } = useTranslation('home')
  return (
    <Dialog title={t('joinMeeting')}>
      <Form
        onSubmit={(data) => {
          navigateToRoom((data.roomId as string).trim())
        }}
        submitLabel={t('joinInputSubmit')}
      >
        <Field
          type="text"
          name="roomId"
          label={t('joinInputLabel')}
          description={t('joinInputExample', {
            example: 'https://meet.numerique.gouv.fr/azer-tyu-qsdf',
          })}
          validate={(value) => {
            return !isRoomValid(value.trim()) ? (
              <>
                <p>{t('joinInputError')}</p>
                <Ul>
                  <li>{window.location.origin}/uio-azer-jkl</li>
                  <li>uio-azer-jkl</li>
                </Ul>
              </>
            ) : null
          }}
        />
      </Form>
      <H lvl={2}>{t('joinMeetingTipHeading')}</H>
      <P last>{t('joinMeetingTipContent')}</P>
    </Dialog>
  )
}
