import { createContext, useContext, useState, type ReactNode } from 'react'
import { loginUser, logoutUser, registerUser, storeTokens } from '@/api/client'

interface AuthContextValue {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('user_email'))

  async function login(email: string, password: string) {
    const tokens = await loginUser(email, password)
    storeTokens(tokens)
    localStorage.setItem('user_email', email)
    setUserEmail(email)
  }

  async function register(email: string, password: string) {
    const tokens = await registerUser(email, password)
    storeTokens(tokens)
    localStorage.setItem('user_email', email)
    setUserEmail(email)
  }

  async function logout() {
    await logoutUser()
    setUserEmail(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: userEmail !== null, userEmail, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
