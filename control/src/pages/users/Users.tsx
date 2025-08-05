// src/pages/users/Users.tsx
import { useQuery, useMutation } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { useNavigate } from "react-router-dom"
import { Trash2, Pencil, UserPlus } from "lucide-react"
import { useState } from "react"

export default function Users() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useQuery(GET_USERS)
  const [deleteUser] = useMutation(DELETE_USER)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (userId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?")
    if (!confirmed) return

    setDeletingId(userId)
    try {
      await deleteUser({ variables: { userId } })
      await refetch()
    } catch (err) {
      console.error("Error deleting user:", err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => navigate("/users/create")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          <UserPlus size={18} />
          New User
        </button>
      </div>

      {loading && <p className="text-center text-gray-400">Loading users...</p>}
      {error && <p className="text-center text-red-500">Error loading users</p>}

      {!loading && data?.users?.length === 0 && (
        <p className="text-center text-gray-400">No users found.</p>
      )}

      {!loading && data?.users?.length > 0 && (
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
              {data.users.map((user: any) => (
                <tr key={user.user_id} className="border-t border-gray-700 hover:bg-gray-700 transition">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/users/edit/${user.user_id}`)}
                      title="Edit user"
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.user_id)}
                      title="Delete user"
                      className={`text-red-500 hover:text-red-400 ${deletingId === user.user_id ? "opacity-50" : ""}`}
                      disabled={deletingId === user.user_id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
