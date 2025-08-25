// control/src/utils/token.ts

// Clave única y consistente en localStorage
const TOKEN_KEY = "token"

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

type JwtPayload = {
  sub?: number | string
  email?: string
  role?: string
  exp?: number // seconds since epoch
  [k: string]: any
}

export function parseToken(token: string | null): JwtPayload | null {
  if (!token) return null
  try {
    const [, payloadB64] = token.split(".")
    if (!payloadB64) return null
    // atob compatible con base64url
    const json = decodeURIComponent(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    const data = JSON.parse(json)
    return data as JwtPayload
  } catch {
    return null
  }
}

export function isTokenExpired(token: string | null): boolean {
  const payload = parseToken(token)
  if (!payload?.exp) return false // si no trae exp, lo consideramos válido
  const nowSec = Math.floor(Date.now() / 1000)
  return nowSec >= payload.exp
}

// Utilidad que ya usas en varios lados
export function getCurrentUserRole(): string | null {
  const p = parseToken(getToken())
  return (p?.role ?? null) as string | null
}