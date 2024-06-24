import {useEffect, useState} from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:8071/api/v1.0/'

export interface User {
  id: string;
  email: string;
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


function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    getMe()
      .then((data) => setAuthenticatedUser(data))
      .catch(() => {
        console.log('user not logged-in.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div>
        loading ...
      </div>
    )
  }

  if (authenticatedUser) {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <p>You are connected as: {authenticatedUser.email}</p>
        <button onClick={() => window.location.replace(new URL('logout/', API_BASE_URL).href)}>Logout</button>
      </div>
    )
  }

  return (
    <button onClick={() => window.location.replace(new URL('authenticate/', API_BASE_URL).href)}>Login</button>
  )
}

export default App
