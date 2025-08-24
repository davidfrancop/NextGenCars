// control/src/components/common/Toast.tsx

import { useEffect, useCallback } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info"
export type ToastState = { type: ToastType; msg: string } | null

type ToastProps = {
  type: ToastType
  msg: string | null
  onClose?: () => void
  duration?: number
}

export default function Toast({ type, msg, onClose, duration = 2600 }: ToastProps) {
  // auto-cierre
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [msg, duration, onClose])

  // cerrar con ESC
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.()
    },
    [onClose]
  )
  useEffect(() => {
    if (!msg) return
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [msg, onKeyDown])

  if (!msg) return null

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info

  // base siempre oscuro para asegurar contraste en cualquier fondo
  const base =
    [
      // posicionamiento: en móviles centrado, en desktop abajo-derecha
      "fixed z-[1000] bottom-4 left-1/2 -translate-x-1/2",
      "sm:left-auto sm:right-4 sm:translate-x-0",
      // caja
      "max-w-sm w-[min(92vw,28rem)]",
      "rounded-xl px-4 py-3 shadow-xl",
      // alto contraste sobre fondos claros u oscuros
      "bg-zinc-900/95 text-zinc-100",
      "ring-1 ring-inset",
      // animación
      "transition-all motion-safe:animate-[fadeIn_.18s_ease-out]",
      // layout
      "flex items-start gap-3",
    ].join(" ")

  const byType = {
    success: "ring-emerald-400/30",
    error: "ring-rose-500/30",
    info: "ring-sky-400/30",
  }[type]

  const iconColor = {
    success: "text-emerald-300",
    error: "text-rose-300",
    info: "text-sky-300",
  }[type]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${base} ${byType}`}
    >
      <Icon className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
      <div className="text-sm leading-5 grow">{msg}</div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="ml-1 inline-flex items-center justify-center rounded-md p-1
                   text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800/70
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                   focus-visible:ring-zinc-500 focus-visible:ring-offset-zinc-900"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

/* Tailwind keyframes (opcional): añade esto a tu CSS global si quieres el fadeIn
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
*/