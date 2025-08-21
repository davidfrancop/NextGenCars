// control/src/components/common/Toast.tsx
import { useEffect } from "react"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

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

  const Icon = type === "success" ? CheckCircle2 : type === "error" ? AlertCircle : Info
  const base =
    "fixed z-50 bottom-4 right-4 max-w-sm rounded-md px-4 py-3 shadow-lg text-white flex items-start gap-3"
  const bg =
    type === "success" ? "bg-emerald-600" : type === "error" ? "bg-rose-600" : "bg-slate-800"

  return (
    <div role="status" aria-live="polite" className={`${base} ${bg}`}>
      <Icon className="mt-0.5 shrink-0" />
      <div className="text-sm">{msg}</div>
    </div>
  )
}
