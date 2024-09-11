import { MenuItem } from 'react-aria-components'
import { menuItemRecipe } from '@/primitives/menuItemRecipe.ts'
import { RiPauseCircleLine, RiRecordCircleLine } from '@remixicon/react'
import { useRecordRoom } from '@/features/rooms/livekit/api/recordRoom.ts'
import { useState } from 'react'
import { egressStore } from '@/stores/egress.tsx'
import { useSnapshot } from 'valtio'

export const RecordingMenuItem = () => {
  const { recordRoom, stopRecordingRoom } = useRecordRoom()

  const egressSnap = useSnapshot(egressStore)
  const egressId = egressSnap.egressId

  const [isPending, setIsPending] = useState(false)

  const handleAction = async () => {
    if (egressId) {
      setIsPending(true)
      const response = await stopRecordingRoom(egressId)
      console.log(response)
      egressStore.egressId = undefined
      setIsPending(false)
    } else {
      setIsPending(true)
      const response = await recordRoom()
      egressStore.egressId = response['egress_id'] as string
      setIsPending(false)
    }
  }

  return (
    <MenuItem
      isDisabled={isPending}
      className={menuItemRecipe({ icon: true })}
      onAction={handleAction}
    >
      {egressId ? (
        <>
          <RiPauseCircleLine size={18} />
          Stop recording room
        </>
      ) : (
        <>
          <RiRecordCircleLine size={18} />
          Record room
        </>
      )}
    </MenuItem>
  )
}
