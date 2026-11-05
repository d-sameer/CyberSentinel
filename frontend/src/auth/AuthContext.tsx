
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  fetchCurrentUser,
  loginRequest,
  type UserProfile,
} from './auth'

const TOKEN_KEY = 'cybersentinel_access_token'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await loginRequest(username, password)

      sessionStorage.setItem(TOKEN_KEY, result.access_token)

      try {
        const profile = await fetchCurrentUser(result.access_token)
        setUser(profile)
      } catch (error) {
        sessionStorage.removeItem(TOKEN_KEY)
        throw error
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const token = sessionStorage.getItem(TOKEN_KEY)

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const profile = await fetchCurrentUser(token)
        if (!cancelled) setUser(profile)
      } catch {
        sessionStorage.removeItem(TOKEN_KEY)
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }

  return context
}
