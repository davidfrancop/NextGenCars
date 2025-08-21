// control/src/components/common/Confirmation.tsx
import { ReactNode } from "react"
import { X } from "lucide-react"

type ConfirmDialogProps = {
  open: boolean
  title?: string
  text?: ReactNode
  confirmText?: string
  cancelText?: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  title = "Confirm",
  text,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onCancel,
  onConfirm,
  loading,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-lg bg-white dark:bg-slate-900 p-5 shadow-xl"
      >
        <button
          aria-label="Close"
          className="absolute right-3 top-3 opacity-70 hover:opacity-100"
          onClick={onCancel}
        >
          <X />
        </button>

        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        {text && <div className="text-sm text-slate-700 dark:text-slate-300 mb-4">{text}</div>}

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
