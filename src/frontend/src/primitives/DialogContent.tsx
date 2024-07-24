import { type ReactNode } from 'react'
import { Heading } from 'react-aria-components'
import { text } from './Text'

/**
 * Dialog content Wrapper.
 *
 * Use this in a <Dialog>, next to the button triggering the dialog.
 * This is helpful to easily add the title to the dialog and keep it
 * next to the actual content code, if you happen to separate the dialog
 * trigger from the dialog content in the code.
 */
export const DialogContent = ({
  children,
  title,
}: {
  title: ReactNode
  children: ReactNode
}) => {
  return (
    <>
      <Heading slot="title" level={1} className={text({ variant: 'h1' })}>
        {title}
      </Heading>
      {children}
    </>
  )
}
