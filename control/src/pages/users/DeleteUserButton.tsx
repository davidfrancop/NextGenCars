// control/src/pages/users/DeleteUserButton.tsx

import { useState } from "react"
import { gql, useMutation } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"

const DELETE_USER = gql`
  mutation DeleteUser($userId: Int!) {
    deleteUser(userId: $userId) {
      user_id
    }
  }
`

export default function DeleteUserButton({
  userId,
  onDeleted,
}: {
  userId: number
  onDeleted?: () => void
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const [deleteUser, { loading }] = useMutation(DELETE_USER, {
    variables: { userId },
    refetchQueries: [{ query: GET_USERS }],
    onCompleted: () => {
      setToast({ type: "success", msg: "Usuario eliminado" })
      onDeleted?.()
      setConfirmOpen(false)
      setTimeout(() => setToast(null), 1200)
    },
    onError: (err) => {
      setToast({ type: "error", msg: err.message || "Error al eliminar" })
      setTimeout(() => setToast(null), 1500)
    },
  })

  return (
    <>
      <button
        type="button"
        className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm"
        onClick={() => setConfirmOpen(true)}
      >
        Delete
      </button>

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm delete</h3>
            <p className="text-gray-300 mb-4">¿Seguro que deseas eliminar este usuario?</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white disabled:opacity-60"
                onClick={() => deleteUser()}
              >
                {loading ? "Deleting..." : "Delete"}
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
