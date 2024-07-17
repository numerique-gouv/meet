import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import {
  LiveKitRoom,
  VideoConference,
  type LocalUserChoices,
} from '@livekit/components-react'
import { keys } from '@/api/queryKeys'
import { QueryAware } from '@/layout/QueryAware'
import { navigateToHome } from '@/navigation/navigateToHome'
import { fetchRoom } from '../api/fetchRoom'
import {Box, Button, Div, H, P, Text} from "@/primitives";

import { cva } from '@/styled-system/css'
import {styled} from "@/styled-system/jsx";
import {useRef, useState} from "react";
import {inviteToRoom} from "@/features/rooms/api/inviteToRoom";


const popin = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "space-between",
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'box.border',
    backgroundColor: 'box.bg',
    color: 'box.text',
    boxShadow: 'box',
    borderRadius: 8,
    padding: 'boxPadding',
    flex: 1,
    position: "absolute",
    zIndex: 100,
  }
})

const Popin = styled('div', popin)

const fakeInput = cva({
  base: {
    height: "40px",
    display: "flex",
    borderRadius: "4px",
    background: "rgb(241,243,244)",
    alignItems: "center",
    marginTop: ".5rem",
    paddingLeft: ".75rem",
    width: "100%",
    justifyContent: "space-between"
  }
})

const FakeInput = styled('div', fakeInput)

const getLocation = () => {
  return window.location.hostname + window.location.pathname;
}

const CopyIcon = ({size = 16}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className="bi bi-copy" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
  </svg>
)

const CloseIcon = ({size = 16}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
  </svg>
)

const Invitation = ({onClose, onOpenEmailModal}) => (
  <Popin style={{ bottom: "100px", left: "24px", maxWidth: "350px" }}>
    <Div style={{display: "flex", justifyContent: "space-between", width: '100%'}}>
      <H lvl={2} style={{ marginBottom: "0.75rem"}}>Votre réunion est prête</H>
      <Div style={{cursor: "pointer"}} onClick={onClose}>
        <CloseIcon size={25} />
      </Div>
    </Div>
    <Button variant="primary" onClick={onOpenEmailModal}>Ajouter des participants</Button>
    <P style={{fontSize: "14px", marginBottom: "0", marginTop: "0.5rem"}}>
      Ou partagez ce lien avec les personnes que vous souhaitez inviter à la réunion
    </P>
    <FakeInput>
      <Text as="span" style={{fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%'}}>{getLocation()}</Text>
      <Div style={{paddingRight: ".75rem", cursor: "pointer"}} onClick={() => navigator.clipboard.writeText(getLocation())}><CopyIcon size={20} /></Div>
    </FakeInput>
    <P style={{fontSize: "12px", marginBottom: "0", marginTop: "0.5rem"}}>
      Les personnes utilisant le lien de cette réunion pourront rejoindre la réunion sans demander votre autorisation.
    </P>
  </Popin>
)


const modalContainer = cva({
 base: {
   display: "flex",
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "center",
   backgroundColor: 'rgba(0, 0, 0, 0.5)',
   height: "100%",
   width: "100%",
   position: "absolute",
   top: 0,
   bottom: 0,
   zIndex: 200,
 }
})

const ModalContainer = styled('div', modalContainer)

const EmailModal = ({onClose, onSubmit, closeOnSubmit = false}) => {
  const emailRef = useRef(null);
  return (
    <ModalContainer>
      <InnerModal>
        <Div style={{display: "flex", justifyContent: "space-between", width: '100%'}}>
          <H lvl={2} style={{ marginBottom: "0.75rem"}}>Inviter des participants</H>
          <Div style={{cursor: "pointer"}} onClick={onClose}>
            <CloseIcon size={25} />
          </Div>
        </Div>
        <P>
          Inviter un participant par email.
        </P>
        <Div style={{width: "100%"}}>
          <input ref={emailRef} type="email" placeholder="sam@meet.co" name="email" style={{border: '1px solid black', borderRadius: '4px', minWidth: '250px', padding: '0 .5rem'}}/>
          <Button onClick={() => {
            const emailValue = emailRef.current.value;
            if(!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
              return
            }
            onSubmit(emailValue)
            if (closeOnSubmit) {
              onClose()
            }
          }}>inviter</Button>
        </Div>
      </InnerModal>
    </ModalContainer>
  )
}


const innerModal = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    justifyContent: "space-between",
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'box.border',
    backgroundColor: 'box.bg',
    color: 'box.text',
    boxShadow: 'box',
    borderRadius: 8,
    padding: 'boxPadding',
    flex: 1,
    maxWidth: "400px"
  }
})

const InnerModal = styled('div', innerModal)

export const Conference = ({
  userConfig,
}: {
  userConfig: LocalUserChoices
}) => {
  const { roomId } = useParams()
  const { status, data } = useQuery({
    queryKey: [keys.room, roomId, userConfig.username],
    queryFn: () =>
      fetchRoom({
        roomId: roomId as string,
        username: userConfig.username,
      }),
  })

  const [isInvitationOpened, setIsInvitationOpened] = useState(true)
  const [isEmailModalOpened, setIsEmailModalOpened] = useState(false)

  return (
    <QueryAware status={status}>
      {
        isInvitationOpened && (
          <Invitation onClose={() => setIsInvitationOpened(false)} onOpenEmailModal={() => setIsEmailModalOpened(true)} />
        )
      }
      {
        isEmailModalOpened && (
          <EmailModal onClose={() => setIsEmailModalOpened(false)} onSubmit={(email) => {
            inviteToRoom(roomId, [email])
          }} closeOnSubmit />
        )
      }
      <LiveKitRoom
        serverUrl={data?.livekit?.url}
        token={data?.livekit?.token}
        connect={true}
        audio={{
          deviceId: userConfig.audioDeviceId,
        }}
        video={{
          deviceId: userConfig.videoDeviceId,
        }}
        onDisconnected={() => {
          navigateToHome()
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </QueryAware>
  )
}
