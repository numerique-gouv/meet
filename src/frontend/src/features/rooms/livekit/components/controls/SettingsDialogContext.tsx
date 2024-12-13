import { SettingsDialogExtended } from '@/features/settings/components/SettingsDialogExtended'
import React, { createContext, useContext, useState } from 'react'

const SettingsDialogContext = createContext<
  | {
      dialogOpen: boolean
      setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
  | undefined
>(undefined)

export const SettingsDialogProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <SettingsDialogContext.Provider value={{ dialogOpen, setDialogOpen }}>
      {children}
      <SettingsDialogExtended
        isOpen={dialogOpen}
        onOpenChange={(v) => !v && setDialogOpen(false)}
      />
    </SettingsDialogContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsDialog = () => {
  const context = useContext(SettingsDialogContext)
  if (!context) {
    throw new Error(
      'useSettingsDialog must be used within a SettingsDialogProvider'
    )
  }
  return context
}
