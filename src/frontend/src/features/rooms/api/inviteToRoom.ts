import {fetchApi} from '@/api/fetchApi'

export const inviteToRoom = (roomId, emails) => {
  return fetchApi(
    `/invite/`,
    {
      method: 'POST',
      body: JSON.stringify(
        {
          emails: emails,
          room: roomId
        }
      )
    }
  ).then((ee) => {
    console.log(ee)
    alert("invitation envoyée")
  }).catch((ee) => {
    console.log(ee)
    alert("invitation failed")
  })
}
