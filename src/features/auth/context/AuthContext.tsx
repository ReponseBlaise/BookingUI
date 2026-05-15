import { createContext, useEffect, useState, useContext, type JSX, type ReactNode } from 'react'
import type { User } from '../types'
import { api } from '../../../lib/api'

const AUTH_USER_KEY = 'authUser'

type AuthContextValue = {
  user: User | null
  login: (user: User, accessToken?: string, refreshToken?: string) => void
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<User>
  uploadAvatar: (file: File) => Promise<User>
  deleteAvatar: () => Promise<User>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const rawUser = localStorage.getItem(AUTH_USER_KEY)

    if (!rawUser) return

    try {
      const parsed = JSON.parse(rawUser) as User
      setUser(parsed)
    } catch {
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }, [])

  const login = (nextUser: User, accessToken?: string, refreshToken?: string) => {
    setUser(nextUser)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser))

    if (accessToken) {
      localStorage.setItem('authToken', accessToken)
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(AUTH_USER_KEY)
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('saved')
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Not authenticated')

    const updated = await api.put<User>(`/users/${user.id}/profile`, data)

    setUser(updated)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))

    return updated
  }

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('Not authenticated')

    const formData = new FormData()
    formData.append('image', file)

    const updated = await api.post<User>(`/users/${user.id}/avatar`, formData)

    setUser(updated)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))

    return updated
  }

  const deleteAvatar = async () => {
    if (!user) throw new Error('Not authenticated')

    const response = await api.delete<{ user: User }>(`/users/${user.id}/avatar`)
    const updated = response.user

    setUser(updated)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated))

    return updated
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, uploadAvatar, deleteAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider')
  return ctx
}
