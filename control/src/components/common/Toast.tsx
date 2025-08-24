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

export default function Toast({ type, msg, onClose, duration = 2200 }: ToastProps) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(t)
  }, [msg, duration, onClose])

  if (!msg) return null

  const Icon =
    type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info

  // Paleta consistente con el resto de páginas (bg-zinc-900 / border-zinc-800)
  // Añadimos un “accent bar” y ring por tipo para contraste sin depender de dark mode.
  const accent =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-rose-500"
      : "bg-indigo-500"

  const ring =
    type === "success"
      ? "ring-emerald-500/30"
      : type === "error"
      ? "ring-rose-500/30"
      : "ring-indigo-500/30"

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "fixed z-50 bottom-4 right-4 max-w-sm w-[min(92vw,28rem)]",
        "rounded-xl overflow-hidden shadow-xl",
        "bg-zinc-900 text-white border border-zinc-800",
        "backdrop-blur supports-[backdrop-filter]:bg-zinc-900/95",
        "ring-1", ring,
      ].join(" ")}
    >
      <div className="flex">
        {/* Accent bar */}
        <div className={["w-1", accent].join(" ")} aria-hidden />

        <div className="flex-1 px-4 py-3 flex items-start gap-3">
          <Icon className="mt-0.5 shrink-0" aria-hidden />
          <div className="text-sm leading-5">{msg}</div>

          <button
            type="button"
            aria-label="Close notification"
            onClick={onClose}
            className="ml-auto inline-flex items-center justify-center rounded-md p-1.5
                       text-zinc-300 hover:text-white hover:bg-zinc-800 focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
                       ring-offset-zinc-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
