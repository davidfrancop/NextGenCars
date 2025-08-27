// control/src/utils/token.ts

export const TOKEN_KEY = "nextgencars_token"

/** Obtiene el token JWT crudo del localStorage */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/** Guarda el token JWT en localStorage */
export function saveToken(token: string) {
  if (typeof token !== "string") {
    console.error("[saveToken] intento de guardar un token no válido:", token)
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

/** Elimina el token JWT del localStorage */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/** Decodifica el payload del JWT (sin verificar la firma) */
export function parseToken(token: string): any {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(atob(payload))
  } catch (err) {
    console.error("[parseToken] error al decodificar token:", err)
    return null
  }
}

/** Verifica si el JWT está expirado */
export function isTokenExpired(token: string): boolean {
  const decoded = parseToken(token)
  if (!decoded?.exp) return true
  return Date.now() >= decoded.exp * 1000
}

/** Devuelve el rol actual del usuario desde el token, o null si no existe */
export function getCurrentUserRole(): string | null {
  const token = getToken()
  if (!token) return null
  const decoded = parseToken(token)
  return decoded?.role ? String(decoded.role).toLowerCase() : null
}
