//control/src/components/Delete.tsx

import { useState } from "react"
import { Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/common/Confirmation"
import Toast, { type ToastState } from "@/components/common/Toast"

type DeleteProps = {
  onDelete: () => Promise<void> | void
  label?: React.ReactNode
  title?: string
  text?: React.ReactNode
  successMessage?: string
  errorMessage?: string
  className?: string
  iconOnly?: boolean
}

export default function Delete({
  onDelete,
  label = "Delete",
  title = "Confirm deletion",
  text = "Are you sure you want to delete this record? This action cannot be undone.",
  successMessage = "Deleted successfully",
  errorMessage = "Delete failed",
  className = "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950",
  iconOnly = false,
}: DeleteProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onDelete()
      setToast({ type: "success", msg: successMessage })
    } catch (e: unknown) {
      setToast({
        type: "error",
        msg: e instanceof Error ? e.message : errorMessage,
      })
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        disabled={loading}
        title={typeof label === "string" ? label : "Delete"}
      >
        <Trash2 size={16} />
        {!iconOnly && label}
      </button>

      <ConfirmDialog
        open={open}
        title={title}
        text={text}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
      />

      <Toast
        type={toast?.type ?? "info"}
        msg={toast?.msg ?? null}
        onClose={() => setToast(null)}
      />
    </>
  )
}