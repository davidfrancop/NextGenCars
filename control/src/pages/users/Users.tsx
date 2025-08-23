// control/src/pages/users/Users.tsx

import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { Pencil, Plus } from "lucide-react"
import Delete from "@/components/common/Delete"

export default function Users() {
  const { data, loading, error, refetch } = useQuery(GET_USERS)

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <Link
          to="/users/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
        >
          <Plus size={18} />
          New User
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
        <table className="min-w-full">
          <thead>
            <tr className="text-left bg-zinc-800/60">
              <th className="px-4 py-3 text-sm font-medium text-zinc-300">Username</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-300">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-300">Role</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-300">Created</th>
              <th className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.users.map((u: any, idx: number) => {
              const isLast = idx === data.users.length - 1
              return (
                <tr
                  key={u.user_id}
                  className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition ${
                    isLast ? "last:border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>
                  <td className="px-4 py-2">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Link
                      to={`/users/edit/${u.user_id}`}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <Delete
                      mutation={DELETE_USER}
                      variables={{ userId: u.user_id }}
                      text={
                        <span>
                          Delete user <strong>{u.username}</strong>?
                        </span>
                      }
                      successMessage="User deleted"
                      errorMessage="Failed to delete user"
                      onCompleted={refetch}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}