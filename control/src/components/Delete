import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useMutation, type DocumentNode } from "@apollo/client"
import ConfirmDialog from "@/components/common/Confirmation"
import Toast, { type ToastState } from "@/components/common/Toast"

type DeleteApolloProps<TVars extends Record<string, any>> = {
  mutation: DocumentNode
  variables: TVars | (() => TVars)
  label?: React.ReactNode
  title?: string
  text?: React.ReactNode
  successMessage?: string
  errorMessage?: string
  onCompleted?: () => Promise<void> | void
  refetchQueries?: Array<{ query: DocumentNode; variables?: Record<string, any> }>
  className?: string
  iconOnly?: boolean
}

export default function DeleteApollo<TVars extends Record<string, any>>({
  mutation,
  variables,
  label = "Delete",
  title = "Confirm deletion",
  text = "Are you sure you want to delete this record? This action cannot be undone.",
  successMessage = "Deleted successfully",
  errorMessage = "Delete failed",
  onCompleted,
  refetchQueries,
  className = "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950",
  iconOnly = false,
}: DeleteApolloProps<TVars>) {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const [run, { loading }] = useMutation(mutation, {
    refetchQueries,
    onCompleted: async () => {
      setToast({ type: "success", msg: successMessage })
      await onCompleted?.()
    },
    onError: (e) => setToast({ type: "error", msg: e?.message || errorMessage }),
  })

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
        onConfirm={async () => {
          const vars = typeof variables === "function" ? (variables as any)() : variables
          await run({ variables: vars })
          setOpen(false)
        }}
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
