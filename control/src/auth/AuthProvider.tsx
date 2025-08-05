import { createContext, useContext, useEffect, useState } from "react"
import { getToken, saveToken, removeToken, parseToken } from "@/utils/token"

type User = {
  role: string
  email: string
  username?: string
  [key: string]: any
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const decoded = parseToken(token)
      if (decoded?.role) {
        setIsAuthenticated(true)
        setUser(decoded)
      }
    }
    setLoading(false) // ✅ marcar como completado después de verificar
  }, [])

  const login = (token: string) => {
    saveToken(token)
    const decoded = parseToken(token)
    if (decoded?.role) {
      setIsAuthenticated(true)
      setUser(decoded)
    }
  }

  const logout = () => {
    removeToken()
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
