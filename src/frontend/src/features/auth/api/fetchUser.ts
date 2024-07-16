import { ApiError } from '@/api/ApiError'
import { fetchApi } from '@/api/fetchApi'
import { type ApiUser } from './ApiUser'
import { authUrl } from "@/features/auth";

const SILENT_LOGIN_KEY = 'initiateSilentLogin';
const SILENT_LOGIN_EXPIRY = 10000;

const shouldInitiateSilentLogin = () => {
  const silentLoginStr = localStorage.getItem(SILENT_LOGIN_KEY)
  if (!silentLoginStr) {
    return true
  }
  const { expiry } = JSON.parse(silentLoginStr)
  const now = new Date()
  return now.getTime() > expiry;
};

const initiateSilentLogin = () => {
  const now = new Date()
  localStorage.setItem(SILENT_LOGIN_KEY, JSON.stringify({expiry: now.getTime() + SILENT_LOGIN_EXPIRY}));
  window.location.href = authUrl(true)
}

/**
 * fetch the logged-in user from the api.
 *
 * If the user is not logged in, the api returns a 401 error.
 * Here our wrapper just returns false in that case, without triggering an error:
 * this is done to prevent unnecessary query retries with react query
 */
export const fetchUser = (): Promise<ApiUser | false> => {
  return new Promise((resolve, reject) => {
    fetchApi<ApiUser>('/users/me')
      .then(resolve)
      .catch((error) => {
        // we assume that a 401 means the user is not logged in
        if (error instanceof ApiError && error.statusCode === 401) {
          if (shouldInitiateSilentLogin()) {
            initiateSilentLogin()
          }
          resolve(false)
        } else {
          reject(error)
        }
      })
  })
}
