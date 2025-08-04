// src/utils/token.ts

const TOKEN_KEY = "nextgencars_token"

// Guarda el token JWT en localStorage
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

// Recupera el token JWT desde localStorage
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

// Elimina el token del localStorage
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// Decodifica el token completo y devuelve el payload
export function parseToken(token: string): any | null {
  try {
    const payloadBase64 = token.split(".")[1]
    const decodedPayload = atob(payloadBase64)
    return JSON.parse(decodedPayload)
  } catch (e) {
    console.error("❌ Error parsing token:", e)
    return null
  }
}

// Extrae el rol del usuario desde un token dado
export function getRoleFromToken(token: string): string | null {
  const payload = parseToken(token)
  return payload?.role?.toLowerCase() || null
}

// ✅ Obtiene el rol actual directamente desde localStorage
export function getCurrentUserRole(): string | null {
  const token = getToken()
  if (!token) return null
  return getRoleFromToken(token)
}
