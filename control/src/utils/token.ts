// control/src/utils/token.ts

export const TOKEN_KEY = "nextgencars_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Decodificar el payload del JWT
export function parseToken(token: string): any {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Verificar expiración
export function isTokenExpired(token: string): boolean {
  const decoded = parseToken(token)
  if (!decoded?.exp) return true
  return Date.now() >= decoded.exp * 1000
}