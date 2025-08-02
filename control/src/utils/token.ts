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

// ✅ Extrae el rol del usuario desde el token JWT
export function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role || null
  } catch (e) {
    console.error("❌ Error decoding token:", e)
    return null
  }
}
