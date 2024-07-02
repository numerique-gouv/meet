import type { ReactNode } from 'react'
import classNames from 'classnames'
import { css } from '@/styled-system/css'
import { Screen } from './Screen'

export const BoxScreen = ({ children }: { children: ReactNode }) => {
  return (
    <Screen>
      <div
        className={classNames(
          css({
            width: '38rem',
            maxWidth: '100%',
            margin: 'auto',
            border: '1px solid #ddd',
            borderRadius: 'lg',
            backgroundColor: 'white',
            boxShadow: 'sm',
            textAlign: 'center',
            marginTop: '6',
            gap: '1',
            padding: '2',
          })
        )}
      >
        {children}
      </div>
    </Screen>
  )
}
