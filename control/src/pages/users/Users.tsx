// src/pages/users/Users.tsx

import { useQuery, useMutation, gql } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { useNavigate } from "react-router-dom"
import { Trash2, Pencil, UserPlus } from "lucide-react"
import { useMemo, useState } from "react"

type User = {
  user_id: number
  username: string
  email: string
  role: string
  created_at: string | null
}

function formatDateSafe(value: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
}

export default function Users() {
  const navigate = useNavigate()

  const { data, loading, error } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
  })

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  // Mutación con optimistic + update para evitar refetch
  const [deleteUser] = useMutation(DELETE_USER, {
    update(cache, { data }) {
      const deletedId: number | undefined = data?.deleteUser?.user_id
      if (!deletedId) return
      // Lee usuarios actuales del cache
      const existing = cache.readQuery<{ users: User[] }>({ query: GET_USERS })
      if (!existing?.users) return
      cache.writeQuery({
        query: GET_USERS,
        data: {
          users: existing.users.filter(u => u.user_id !== deletedId),
        },
      })
    },
    onCompleted: () => {
      setToast({ type: "success", msg: "User deleted" })
      setTimeout(() => setToast(null), 1500)
    },
    onError: (err) => {
      setToast({ type: "error", msg: err.message || "Error deleting user" })
      setTimeout(() => setToast(null), 1800)
    },
  })

  const users: User[] = useMemo(() => data?.users ?? [], [data])

  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    setDeletingId(userId)
    try {
      await deleteUser({
        variables: { user_id: userId }, // 👈 nombre exacto que espera el backend
        optimisticResponse: {
          deleteUser: { __typename: "User", user_id: userId },
        },
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          type="button"
          onClick={() => navigate("/users/create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          <UserPlus size={18} />
          New User
        </button>
      </div>

      {loading && <p className="text-center text-gray-400">Loading users...</p>}
      {error && <p className="text-center text-red-500">Error loading users</p>}

      {!loading && users.length === 0 && (
        <p className="text-center text-gray-400">No users found.</p>
      )}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-4 py-2">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Created At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isRowDeleting = deletingId === user.user_id
                return (
                  <tr
                    key={user.user_id}
                    className={`border-t border-gray-700 transition ${
                      isRowDeleting ? "opacity-60" : "hover:bg-gray-700"
                    }`}
                  >
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">{formatDateSafe(user.created_at)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/edit/${user.user_id}`)}
                          title="Edit user"
                          className="inline-flex text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                          disabled={isRowDeleting}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.user_id)}
                          title="Delete user"
                          className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                          disabled={isRowDeleting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
    </div>
  )
}
