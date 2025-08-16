// src/utils/token.ts

const TOKEN_KEY = "nextgencars_token"

// ===== Tipos =====
export type JWTPayload = {
  sub?: string
  email?: string
  role?: string
  exp?: number // segundos desde epoch
  iat?: number
  [k: string]: unknown
}

// ===== Helpers de almacenamiento =====
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// ===== Base64URL decode seguro =====
function base64UrlDecode(input: string): string {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "===".slice((base64.length + 3) % 4)
    return typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary")
  } catch {
    return ""
  }
}

// ===== Parseo/lectura de payload =====
export function parseToken(token: string): JWTPayload | null {
  try {
    const [, payloadB64] = token.split(".")
    if (!payloadB64) return null
    const json = base64UrlDecode(payloadB64)
    return JSON.parse(json) as JWTPayload
  } catch (e) {
    console.warn("⚠️ Error parsing token:", e)
    return null
  }
}

export function getRoleFromToken(token: string): string | null {
  const payload = parseToken(token)
  return payload?.role ? String(payload.role).toLowerCase() : null
}

export function getCurrentUserRole(): string | null {
  const token = getToken()
  return token ? getRoleFromToken(token) : null
}

export function getUserEmail(): string | null {
  const token = getToken()
  const p = token ? parseToken(token) : null
  return (p?.email as string) ?? null
}

export function getUserId(): string | null {
  const token = getToken()
  const p = token ? parseToken(token) : null
  return (p?.sub as string) ?? null
}

// ===== Estado/validación =====
export function isTokenExpired(token: string): boolean {
  const payload = parseToken(token)
  if (!payload?.exp) return false
  const nowSec = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSec
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  return !isTokenExpired(token)
}

export function hasRole(allowed: string[] = []): boolean {
  if (!allowed.length) return isAuthenticated()
  const token = getToken()
  if (!token || isTokenExpired(token)) return false
  const role = getRoleFromToken(token)
  return role ? allowed.map(r => r.toLowerCase()).includes(role) : false
}

// ===== Utilidad opcional para logout forzado =====
export function ensureAuthOrLogout(): boolean {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    removeToken()
    return false
  }
  return true
}
