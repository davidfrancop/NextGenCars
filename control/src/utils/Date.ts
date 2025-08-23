import { format } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatea un string ISO completo (UTC) a formato europeo dd/MM/yyyy
 * para mostrar en tablas y formularios.
 */
export function formatDateEU(value?: string | null): string {
  if (!value) return ""
  try {
    return format(new Date(value), "dd/MM/yyyy", { locale: es })
  } catch {
    return value
  }
}

/**
 * Convierte un string dd/MM/yyyy (input usuario) a ISO completo (UTC).
 * Útil cuando trabajas con DateTime (ej. appointments).
 */
export function parseDateEU(value?: string | null): string | null {
  if (!value) return null
  const [day, month, year] = value.split("/")
  if (!day || !month || !year) return null
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * Para <input type="date"> (que devuelve "YYYY-MM-DD"):
 * lo convierte a ISO completo "YYYY-MM-DDT00:00:00.000Z".
 */
export function toISODateOrNull(yyyyMmDd: string): string | null {
  if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null
  const d = new Date(`${yyyyMmDd}T00:00:00Z`)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/**
 * Convierte un ISO string o Date a "YYYY-MM-DD" para usar en <input type="date">
 */
export function isoToYyyyMmDd(raw?: string | number | null): string {
  if (raw == null || raw === "") return ""
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw
  let d: Date
  if (typeof raw === "number") d = new Date(raw)
  else if (/^\d+$/.test(String(raw))) d = new Date(Number(raw))
  else d = new Date(raw)
  if (isNaN(d.getTime())) return ""
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}