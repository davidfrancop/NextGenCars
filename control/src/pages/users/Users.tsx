// control/src/pages/users/Users.tsx

import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { Pencil, Plus } from "lucide-react"
import Delete from "@/components/common/Delete"

export default function Users() {
  const { data, loading, error, refetch } = useQuery(GET_USERS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Users</h1>
        <Link
          to="/users/create"
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <Plus size={16} />
          New User
        </Link>
      </div>

      <table className="min-w-full border text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th className="px-3 py-2 text-left">Username</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Role</th>
            <th className="px-3 py-2 text-left">Created</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((u: any) => (
            <tr key={u.user_id} className="border-t">
              <td className="px-3 py-2">{u.username}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">{u.role}</td>
              <td className="px-3 py-2">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="px-3 py-2 text-right space-x-2">
                <Link
                  to={`/users/edit/${u.user_id}`}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  <Pencil size={16} />
                  Edit
                </Link>

                {/* ✅ Reemplazo del antiguo DeleteUserButton */}
                <Delete
                  mutation={DELETE_USER}
                  variables={{ user_id: u.user_id }}
                  text={
                    <span>
                      Delete user <strong>{u.username}</strong>?
                    </span>
                  }
                  successMessage="User deleted"
                  errorMessage="Failed to delete user"
                  onCompleted={refetch}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
