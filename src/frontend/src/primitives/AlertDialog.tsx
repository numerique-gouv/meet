import { Dialog, type DialogProps } from './Dialog'

export const AlertDialog = (props: DialogProps) => {
  return <Dialog role="alertdialog" {...props} />
}
