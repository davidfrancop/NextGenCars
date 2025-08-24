// control/src/components/common/Toast.tsx
import { useEffect } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info"
export type ToastState = { type: ToastType; msg: string } | null

type ToastProps = {
  type: ToastType
  msg: string | null
  onClose?: () => void
  duration?: number
}

/**
 * Toast compatible con tema oscuro:
 * - Fondo y borde por tipo (emerald/rose/zinc)
 * - Texto siempre legible
 * - Botón de cerrar accesible
 * - Autocierre con `duration`
 */
export default function Toast({ type, msg, onClose, duration = 2200 }: ToastProps) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [msg, duration, onClose])

  if (!msg) return null

  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info

  // Paleta por tipo (dark-first). Para light mode, heredará bien por contraste.
  const tone =
    type === "success"
      ? {
          container: "bg-emerald-950/80 border-emerald-500/40 text-emerald-50",
          icon: "text-emerald-400",
        }
      : type === "error"
      ? {
          container: "bg-rose-950/80 border-rose-500/40 text-rose-50",
          icon: "text-rose-400",
        }
      : {
          container: "bg-zinc-900/90 border-zinc-700 text-zinc-100",
          icon: "text-zinc-300",
        }

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed z-50 bottom-4 right-4 max-w-sm",
        "rounded-xl border px-4 py-3 shadow-xl",
        "backdrop-blur supports-[backdrop-filter]:bg-opacity-90",
        "flex items-start gap-3",
        tone.container,
      ].join(" ")}
    >
      <Icon className={`mt-0.5 shrink-0 ${tone.icon}`} aria-hidden="true" />
      <div className="text-sm leading-5 pr-6">{msg}</div>

      {/* Botón cerrar */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="absolute top-2.5 right-2.5 inline-flex items-center justify-center rounded-md p-1
                   text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-0
                   focus:ring-white/30"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}