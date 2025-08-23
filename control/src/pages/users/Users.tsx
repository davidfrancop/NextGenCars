// control/src/pages/users/Users.tsx

import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { Pencil, Plus, Trash2 } from "lucide-react"
import Delete from "@/components/common/Delete"

export default function Users() {
  const { data, loading, error, refetch } = useQuery(GET_USERS)

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link
          to="/users/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
        >
          <Plus size={18} />
          New User
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Username</th>
              <th className="px-4 py-2 text-left font-medium">Email</th>
              <th className="px-4 py-2 text-left font-medium">Role</th>
              <th className="px-4 py-2 text-left font-medium">Created</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u: any) => (
              <tr key={u.user_id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Link
                    to={`/users/edit/${u.user_id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
                  >
                    <Pencil size={16} />
                    Edit
                  </Link>

                  <Delete
                    mutation={DELETE_USER}
                    variables={{ userId: u.user_id }}
                    label={
                      <span className="inline-flex items-center gap-1">
                        <Trash2 size={16} />
                        Delete
                      </span>
                    }
                    text={
                      <span>
                        Delete user <strong>{u.username}</strong>?
                      </span>
                    }
                    successMessage="User deleted"
                    errorMessage="Failed to delete user"
                    onCompleted={refetch}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md border border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}