import { useTranslation } from 'react-i18next'
import { Field, Form, Dialog, DialogProps } from '@/primitives'
import {
  usePersistentUserChoices,
  useRoomContext,
} from '@livekit/components-react'

export type UsernameDialogProps = Pick<DialogProps, 'isOpen' | 'onOpenChange'>

export const UsernameDialog = (props: UsernameDialogProps) => {
  const { t } = useTranslation('rooms')
  const { saveUsername } = usePersistentUserChoices()

  const ctx = useRoomContext()
  return (
    <Dialog title={t('options.username.heading')} {...props}>
      <Form
        onSubmit={(data) => {
          const { username } = data as { username: string }
          ctx.localParticipant.setName(username)
          saveUsername(username)
          const { onOpenChange } = props
          if (onOpenChange) {
            onOpenChange(false)
          }
        }}
        submitLabel={t('options.username.submitLabel')}
      >
        <Field
          type="text"
          name="username"
          label={t('options.username.label')}
          description={t('options.username.description')}
          defaultValue={ctx.localParticipant.name}
          validate={(value) => {
            return !value ? (
              <p>{t('options.username.validationError')}</p>
            ) : null
          }}
        />
      </Form>
    </Dialog>
  )
}
