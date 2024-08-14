import {
  Tabs as RACTabs,
  Tab as RACTab,
  TabPanel as RACTabPanel,
  TabList as RACTabList,
  TabProps as RACTabProps,
  TabsProps as RACTabsProps,
  TabListProps as RACTabListProps,
  TabPanelProps as RACTabPanelProps,
} from 'react-aria-components'
import { styled } from '@/styled-system/jsx'
import { StyledVariantProps } from '@/styled-system/types'
import React from 'react'

const StyledTabs = styled(RACTabs, {
  base: {
    display: 'flex',
    color: 'colorPalette.text',
    '&[data-orientation=horizontal]': {
      flexDirection: 'column',
      '--horizontal': '3px',
    },
    '&[data-orientation=vertical]': {
      flexDirection: 'row',
      '--vertical': '3px',
    },
  },
})

export type TabsProps = RACTabsProps & StyledVariantProps<typeof StyledTabs>

export const Tabs = ({ children, ...props }: TabsProps) => {
  return <StyledTabs {...props}>{children}</StyledTabs>
}

const StyledTab = styled(RACTab, {
  base: {
    padding: '10px',
    cursor: 'pointer',
    outline: 'none',
    position: 'relative',
    color: 'box.text',
    transition: 'color 200ms ease, backgroundColor 200ms ease',
    borderColor: 'transparent',
    forcedColorAdjust: 'none',
  },
  variants: {
    border: {
      true: {
        '&[data-selected]': {
          borderColor: 'primary',
        },
        borderBottom: 'var(--horizontal) solid',
        borderInlineEnd: 'var(--vertical) solid',
      },
      false: {
        border: 'none',
      },
    },
  },
  defaultVariants: {
    border: true,
  },
})

export type TabProps = RACTabProps & StyledVariantProps<typeof StyledTab>

export const Tab = ({ children, ...props }: TabProps) => {
  const parentBorder = React.useContext(BorderContext)
  return (
    <StyledTab border={parentBorder} {...props}>
      {children}
    </StyledTab>
  )
}

const StyledTabList = styled(RACTabList, {
  base: {
    display: 'flex',
    '&[data-orientation=vertical]': {
      flexDirection: 'column',
    },
  },
  variants: {
    border: {
      false: {
        border: 'none',
      },
      true: {
        '&[data-orientation=horizontal]': {
          borderBottom: '1px solid',
          borderColor: 'gray.300',
        },
        '&[data-orientation=vertical]': {
          borderInlineEnd: '1px solid',
          borderColor: 'gray.300',
        },
      },
    },
  },
  defaultVariants: {
    border: true,
  },
})

// @fixme type could be simplified to avoid redefining the children props
export type TabListProps = {
  children: React.ReactNode
} & RACTabListProps<typeof Tab> &
  StyledVariantProps<typeof StyledTabList>

const BorderContext = React.createContext<boolean | undefined>(true)

export const TabList = ({ children, border, ...props }: TabListProps) => {
  return (
    <BorderContext.Provider value={border}>
      <StyledTabList {...props} border={border}>
        {children}
      </StyledTabList>
    </BorderContext.Provider>
  )
}

const StyledTabPanel = styled(RACTabPanel, {
  base: {
    marginTop: '4px',
    padding: '10px',
    borderRadius: '4px',
    outline: 'none',
    '&[data-focus-visible]': {
      outline: '2px solid red',
    },
  },
})

export type TabPanelProps = RACTabPanelProps &
  StyledVariantProps<typeof StyledTabPanel>

export const TabPanel = ({ children, ...props }: TabPanelProps) => {
  return <StyledTabPanel {...props}>{children}</StyledTabPanel>
}
