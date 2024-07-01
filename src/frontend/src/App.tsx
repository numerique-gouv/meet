import {useEffect, useState} from 'react'
import './App.css'
import {LiveKitRoom, VideoConference} from "@livekit/components-react";

import '@livekit/components-styles';

const API_BASE_URL = 'http://localhost:8071/api/v1.0/'
const LIVEKIT_SERVER_URL = 'http://localhost:7880'

export interface User {
  id: string;
  email: string;
}

export interface Room {
  livekit?: {
    token: string
  };
  is_public: boolean;
}

function getCSRFToken() {
  return document.cookie
    .split(';')
    .filter((cookie) => cookie.trim().startsWith('csrftoken='))
    .map((cookie) => cookie.split('=')[1])
    .pop();
}

async function getMe() {
  const csrfToken = getCSRFToken();
  const response = await fetch(
    `${API_BASE_URL}users/me/`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && {'X-CSRFToken': csrfToken}),
      },
    }
  )
  if (!response.ok) {
    throw new Error(`Couldn't fetch user data: ${response.statusText}`);
  }
  return response.json() as Promise<User>;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function fetchRoom(roomId: string) {
  const csrfToken = getCSRFToken();
  const response = await fetch(
    `${API_BASE_URL}rooms/${roomId}/`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && {'X-CSRFToken': csrfToken}),
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Couldn't fetch room data: ${response.statusText}`);
  }

  return response.json() as Promise<Room>;
}


function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null)
  const [roomData, setRoomData] = useState<Room | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    getMe()
      .then((data) => setAuthenticatedUser(data))
      .catch(() => {
        console.log('user not logged-in.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const getRoom = async () => {

    const roomName = (document.getElementById('roomName')as HTMLInputElement)?.value || crypto.randomUUID()
    const roomData = await fetchRoom(slugify(roomName))
    setRoomData(roomData)

    if (!roomData.livekit && !roomData.is_public) {
      alert('no access')
    }
  }

  if (isLoading) {
    return (
      <div>
        loading ...
      </div>
    )
  }

  return (
    <div>
      {
        authenticatedUser ? (
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <p>You are connected as: {authenticatedUser.email}</p>
            <button onClick={() => window.location.replace(new URL('logout/', API_BASE_URL).href)}>Logout</button>
          </div>
        ) : (
          <button onClick={() => window.location.replace(new URL('authenticate/', API_BASE_URL).href)}>Login</button>
        )
      }
      <>
        <input id="roomName" type="text" placeholder="Room name"/>
        <button onClick={() => getRoom()}>Get room</button>
      </>
      {
        roomData?.livekit && (
          <LiveKitRoom serverUrl={LIVEKIT_SERVER_URL} token={roomData?.livekit?.token} connect={true}>
            <VideoConference/>
          </LiveKitRoom>
        )
      }
    </div>
  )
}

export default App
