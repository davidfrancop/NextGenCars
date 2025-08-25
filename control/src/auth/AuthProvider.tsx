// control/src/auth/AuthProvider.tsx

import { createContext, useContext, useEffect, useState } from "react"
import { getToken, saveToken, removeToken, parseToken, isTokenExpired } from "@/utils/token"

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

  const applyToken = (token: string | null) => {
    if (!token || isTokenExpired(token)) {
      removeToken()
      setIsAuthenticated(false)
      setUser(null)
      return
    }
    const decoded = parseToken(token)
    if (decoded?.role) {
      setIsAuthenticated(true)
      setUser({
        ...decoded,
        role: decoded.role || "",
        email: decoded.email || "",
      })
    }
  }

  useEffect(() => {
    // Chequeo inicial
    applyToken(getToken())
    setLoading(false)
    // Chequeo periódico
    const interval = setInterval(() => applyToken(getToken()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const login = (token: string) => {
    saveToken(token)           // 👉 guarda en localStorage bajo la clave "token"
    applyToken(token)          // 👉 actualiza estado
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
