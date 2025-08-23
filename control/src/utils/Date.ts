//control/src/utils/Date.ts

import { format } from "date-fns"
import { es } from "date-fns/locale"

/**
 * Formatea un string ISO (UTC) a formato europeo dd/MM/yyyy
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
 * Convierte un string dd/MM/yyyy (input usuario) a ISO string (UTC)
 * para enviar al backend.
 */
export function parseDateEU(value?: string | null): string | null {
  if (!value) return null
  const [day, month, year] = value.split("/")
  if (!day || !month || !year) return null
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return isNaN(date.getTime()) ? null : date.toISOString()
}
