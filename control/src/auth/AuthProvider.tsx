// control/src/auth/AuthProvider.tsx

import { createContext, useContext, useEffect, useState } from "react"
import { getToken, saveToken, removeToken, parseToken, isTokenExpired } from "@/utils/token"
import { allRoles } from "@/config/menuItems"

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
    const role = decoded?.role ? String(decoded.role).toLowerCase() : ""
    if (decoded && allRoles.includes(role as any)) {
      setIsAuthenticated(true)
      setUser({
        ...decoded,
        role,
        email: decoded.email || "",
      })
    } else {
      removeToken()
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  useEffect(() => {
    applyToken(getToken())
    setLoading(false)
    const interval = setInterval(() => applyToken(getToken()), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const login = (token: string) => {
    saveToken(token)   // ✅ ahora guarda en "nextgencars_token"
    applyToken(token)
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