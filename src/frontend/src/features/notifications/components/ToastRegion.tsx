import { AriaToastRegionProps, useToastRegion } from '@react-aria/toast'
import type { ToastState } from '@react-stately/toast'
import { Toast } from './Toast'
import { useRef } from 'react'
import { NotificationType } from '../NotificationType'
import { ToastJoined } from './ToastJoined'
import { ToastData } from './ToastProvider'

interface ToastRegionProps extends AriaToastRegionProps {
  state: ToastState<ToastData>
}

export function ToastRegion({ state, ...props }: ToastRegionProps) {
  const ref = useRef(null)
  const { regionProps } = useToastRegion(props, state, ref)
  return (
    <div {...regionProps} ref={ref} className="toast-region">
      {state.visibleToasts.map((toast) => {
        if (toast.content?.type === NotificationType.Joined) {
          return <ToastJoined key={toast.key} toast={toast} state={state} />
        }
        return <Toast key={toast.key} toast={toast} state={state} />
      })}
    </div>
  )
}
