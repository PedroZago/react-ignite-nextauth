import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'

import { api } from '../services/apiClient';
import { AxiosRequestConfig, AxiosRequestHeaders, HeadersDefaults } from 'axios';

interface SmartAxiosDefaults<D = any> extends Omit<AxiosRequestConfig<D>, 'headers'> {
  headers: HeadersDefaults & AxiosRequestHeaders;
}

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInData = {
  token: string;
  refreshToken: string;
  permissions: string[];
  roles: string[];
}

type AuthProviderProps = {
  children: ReactNode;
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export const signOut = () => {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  authChannel.postMessage('signOut')

  Router.push('/')
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>({} as User)

  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut()
          break
        // case 'signIn':
        //   Router.push('/dashboard')
        //   break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get<User>('/me')
        .then((response) => {
          const { email, permissions, roles } = response.data

          setUser({ email, permissions, roles })
        })
        .catch(() => {
          signOut()
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post<SignInData>('sessions', {
        email,
        password
      })

      const { token, refreshToken, permissions, roles } = response.data

      setUser({
        email,
        permissions,
        roles
      })

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      const apiDefaults = api.defaults as SmartAxiosDefaults

      apiDefaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard')

      // authChannel.postMessage('signIn')
    } catch (error) {
      if (error instanceof EvalError) {
        throw new Error(error.message)
      }
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  return context
}