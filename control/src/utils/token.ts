// control/src/utils/token.ts
import type { Role } from "@/config/menuItems"

export const TOKEN_KEY = "nextgencars_token"

export type JwtPayload = {
  user_id?: number
  username?: string
  role?: Role | string
  exp?: number // seconds since epoch
  iat?: number
}

/** Safe check for browser env */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

/** Read token from storage (browser only) */
export function getToken(): string | null {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Save token into storage (browser only) */
export function saveToken(token: string) {
  if (!isBrowser()) return
  if (typeof token !== "string") {
    console.error("[saveToken] invalid token:", token)
    return
  }
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* no-op */
  }
}

/** Remove token from storage (browser only) */
export function removeToken() {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* no-op */
  }
}

/** Base64URL -> string */
function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64 + "===".slice((base64.length + 3) % 4)
  const binary =
    typeof atob === "function"
      ? atob(padded)
      : Buffer.from(padded, "base64").toString("binary")
  let output = ""
  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    output += "%" + ("00" + c.toString(16)).slice(-2)
  }
  return decodeURIComponent(output)
}

/** Decode JWT payload safely (no signature verification) */
export function parseToken(token: string): any {
  try {
    const [, payload] = token.split(".")
    return JSON.parse(base64UrlDecode(payload))
  } catch (err) {
    console.error("[parseToken] failed to decode token:", err)
    return null
  }
}

/** Type-safe parser returning JwtPayload */
export function parseJwt(token: string | null): JwtPayload | null {
  if (!token) return null
  const p = parseToken(token)
  return p ?? null
}

/** Check if the JWT is expired */
export function isTokenExpired(token: string): boolean {
  const decoded = parseToken(token) as JwtPayload | null
  if (!decoded?.exp) return true
  return Date.now() >= decoded.exp * 1000
}

/** Current user role from token (lowercased), or null */
export function getCurrentUserRole(): string | null {
  const token = getToken()
  if (!token) return null
  const decoded = parseToken(token) as JwtPayload | null
  const r = decoded?.role
  return r ? String(r).toLowerCase() : null
}

/** Return current user payload from stored token if valid (not expired) */
export function currentUser(): JwtPayload | null {
  const token = getToken()
  if (!token || isTokenExpired(token)) return null
  return parseJwt(token)
}

/** True if there is a non-expired token */
export function isAuthenticated(): boolean {
  return currentUser() != null
}

/**
 * RBAC: checks if current user has any of the allowed roles.
 * - If `allowed` is omitted or empty, we only require authentication.
 */
export function hasRole(allowed?: Role[]): boolean {
  const user = currentUser()
  if (!user?.role) return false
  if (!allowed || allowed.length === 0) return true
  // normalize possible string role into Role union
  const role = (String(user.role) as Role)
  return allowed.includes(role)
}

/** Convenience: get user role as union Role or null */
export function getRole(): Role | null {
  const r = currentUser()?.role
  return r ? (String(r) as Role) : null
}