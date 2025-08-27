const TOKEN_KEY = "nextgencars_token"

// Tipos
export type JWTPayload = { sub?: string; email?: string; role?: string; exp?: number; iat?: number; [k: string]: unknown }

// Safe localStorage
function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null
  try { return window.localStorage } catch { return null }
}

// Helpers de almacenamiento
export function saveToken(token: string) {
  safeLocalStorage()?.setItem(TOKEN_KEY, token)
}
export function getToken(): string | null {
  return safeLocalStorage()?.getItem(TOKEN_KEY) ?? null
}
export function removeToken() {
  safeLocalStorage()?.removeItem(TOKEN_KEY)
}

// Base64URL decode seguro
// @ts-expect-error atob no existe en Node
declare const atob: (data: string) => string
function base64UrlDecode(input: string): string {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "===".slice((base64.length + 3) % 4)
    return typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("utf-8")
  } catch {
    return ""
  }
}

// Parseo token
export function parseToken(token: string): JWTPayload | null {
  try {
    const [, payloadB64] = token.split(".")
    if (!payloadB64) return null
    return JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload
  } catch {
    return null
  }
}

export function getRoleFromToken(token: string): string | null {
  return parseToken(token)?.role?.toLowerCase() ?? null
}
export function getCurrentUserRole(): string | null {
  const t = getToken()
  return t ? getRoleFromToken(t) : null
}
export function getUserEmail(): string | null {
  return parseToken(getToken() ?? "")?.email ?? null
}
export function getUserId(): string | null {
  return parseToken(getToken() ?? "")?.sub ?? null
}

// Estado
export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token)
  if (!payload?.exp) return false
  return payload.exp <= Math.floor(Date.now() / 1000)
}
export function isAuthenticated(): boolean {
  const t = getToken()
  return !!t && !isTokenExpired(t)
}
export function hasRole(allowed: string[] = []): boolean {
  if (!allowed.length) return isAuthenticated()
  const t = getToken()
  if (!t || isTokenExpired(t)) return false
  const role = getRoleFromToken(t)
  return !!role && allowed.map(r => r.toLowerCase()).includes(role)
}
export function ensureAuthOrLogout(): boolean {
  const t = getToken()
  if (!t || isTokenExpired(t)) {
    removeToken()
    return false
  }
  return true
}