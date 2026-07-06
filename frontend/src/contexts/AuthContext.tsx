import { createContext, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { LoginRequest, LoginResponse } from '../types'

interface AuthContextType {
  token: string | null
  username: string | null
  role: string | null
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'))
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('role'))

  async function login(data: LoginRequest) {
    const res = await api.post<LoginResponse>('/auth/login', data)
    const { token: t, username: u, role: r } = res.data
    localStorage.setItem('token', t)
    localStorage.setItem('username', u)
    localStorage.setItem('role', r)
    setToken(t)
    setUsername(u)
    setRole(r)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setToken(null)
    setUsername(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ token, username, role, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
