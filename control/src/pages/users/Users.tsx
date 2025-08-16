// control/src/pages/users/Users.tsx

import { useMemo } from "react"
import { useQuery } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { useNavigate } from "react-router-dom"
import { Pencil, UserPlus } from "lucide-react"
import DeleteUserButton from "./DeleteUserButton"

type User = {
  user_id: number
  username: string
  email: string
  role: string
  created_at: string | null
}

export default function Users() {
  const navigate = useNavigate()
  const { data, loading, error } = useQuery(GET_USERS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const users: User[] = useMemo(() => data?.users ?? [], [data])

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <button
          onClick={() => navigate("/users/create")}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2"
        >
          <UserPlus size={18} />
          New User
        </button>
      </div>

      {loading && <p className="text-center text-gray-400">Loading users...</p>}
      {error && <p className="text-center text-red-500">Error loading users</p>}
      {!loading && users.length === 0 && <p className="text-center text-gray-400">No users found.</p>}

      {!loading && users.length > 0 && (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-t border-gray-700">
                  <td className="px-4 py-3">{u.user_id}</td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/users/${u.user_id}/edit`)}
                        className="inline-flex items-center gap-1 rounded-md bg-gray-700 hover:bg-gray-600 px-2 py-1"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <DeleteUserButton userId={u.user_id} username={u.username} />
                    </div>
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
