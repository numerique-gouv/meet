import React from 'react'
import clsx from 'clsx'

/** @internal function from LiveKit*/
export function cloneSingleChild(
  children: React.ReactNode | React.ReactNode[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  key?: any
) {
  return React.Children.map(children, (child) => {
    // Checking isValidElement is the safe way and avoids a typescript
    // error too.
    if (React.isValidElement(child) && React.Children.only(children)) {
      if (child.props.class) {
        // make sure we retain classnames of both passed props and child
        props ??= {}
        props.class = clsx(child.props.class, props.class)
        props.style = { ...child.props.style, ...props.style }
      }
      return React.cloneElement(child, { ...props, key })
    }
    return child
  })
}
