import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies'
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from '../errors/AuthTokenError';

type ResponseError = {
  error?: boolean;
  code?: string;
  message?: string;
}

type failedRequestsQueue = {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}

let isRefreshing = false
let failedRequestsQueue: failedRequestsQueue[] = []

export const setupAPIClient = (ctx: undefined | GetServerSidePropsContext = undefined) => {
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['nextauth.token']}`
    }
  })

  api.interceptors.response.use(response => {
    return response
  }, (error: AxiosError<ResponseError>) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies(ctx)

        const { 'nextauth.refreshToken': refreshToken } = cookies
        const originalConfig = error.config

        if (!isRefreshing) {
          isRefreshing = true

          api.post('/refresh', {
            refreshToken
          })
            .then(response => {
              const { token } = response?.data

              setCookie(ctx, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })

              setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`

              failedRequestsQueue.forEach(request => request.resolve(token))
              failedRequestsQueue = []
            })
            .catch(error => {
              failedRequestsQueue.forEach(request => request.reject(error))
              failedRequestsQueue = []

              if (typeof window !== 'undefined') {
                signOut()
              }
            })
            .finally(() => {
              isRefreshing = false
            })
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (token: string) => {
              originalConfig.headers!['Authorization'] = `Bearer ${token}`

              resolve(api(originalConfig))
            },
            reject: (err: AxiosError) => {
              reject(err)
            }
          })
        })
      } else {
        if (typeof window !== 'undefined') {
          signOut()
        } else {
          return Promise.reject(new AuthTokenError())
        }
      }
    }

    return Promise.reject(error)
  })

  return api
}