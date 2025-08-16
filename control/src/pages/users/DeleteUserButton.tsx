// control/src/pages/users/DeleteUserButton.tsx

import { useState } from "react"
import { useMutation } from "@apollo/client"
import { Trash2 } from "lucide-react"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { GET_USERS } from "@/graphql/queries/getUsers"

type Toast = { type: "success" | "error"; msg: string } | null

export default function DeleteUserButton({
  userId,
  username,
  onDeleted,
  size = 18,
}: {
  userId: number
  username?: string
  onDeleted?: () => void
  size?: number
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<Toast>(null)

  const [mutate, { loading }] = useMutation(DELETE_USER, {
    variables: { userId },
    errorPolicy: "all",
    update(cache, { data }) {
      const deletedId: number | undefined = data?.deleteUser?.user_id
      if (!deletedId) return
      const existing = cache.readQuery<{ users: any[] }>({ query: GET_USERS })
      if (!existing?.users) return
      cache.writeQuery({
        query: GET_USERS,
        data: { users: existing.users.filter((u) => u.user_id !== deletedId) },
      })
    },
    onCompleted() {
      setToast({ type: "success", msg: "User deleted." })
      onDeleted?.()
      setConfirmOpen(false)
      setTimeout(() => setToast(null), 1200)
    },
    onError(err) {
      setToast({ type: "error", msg: err?.message || "Could not delete the user." })
      setTimeout(() => setToast(null), 1800)
    },
  })

  return (
    <>
      <button
        title="Delete"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-500 px-2 py-1"
      >
        <Trash2 size={size} />
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg bg-gray-800 p-5 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm deletion</h3>
            <p className="text-sm text-gray-300">
              Delete {username ? <strong>{username}</strong> : "this user"}? This action cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md bg-gray-700 hover:bg-gray-600 px-3 py-2"
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 hover:bg-red-500 px-3 py-2 disabled:opacity-60"
                onClick={() => mutate()}
                disabled={loading}
              >
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
