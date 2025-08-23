// control/src/pages/users/Users.tsx

import { useQuery } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { DELETE_USER } from "@/graphql/mutations/deleteUser"
import { Users as UsersIcon, Pencil, Plus } from "lucide-react"
import Delete from "@/components/common/Delete"

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "admin":
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-rose-900/40 border border-rose-800 text-rose-200">
          ADMIN
        </span>
      )
    case "frontdesk":
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/40 border border-sky-800 text-sky-200">
          FRONTDESK
        </span>
      )
    case "mechanic":
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-800 text-amber-200">
          MECHANIC
        </span>
      )
    default:
      return <span className="text-xs text-zinc-400">{role}</span>
  }
}

export default function Users() {
  const { data, loading, error, refetch } = useQuery(GET_USERS)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <UsersIcon size={26} />
          Users
        </h1>
        <Link
          to="/users/create"
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          aria-label="New User"
          title="New User"
        >
          <Plus size={16} />
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
                  <td className="px-4 py-2">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-2">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        to={`/users/edit/${u.user_id}`}
                        className="inline-flex text-amber-400 hover:text-amber-300"
                        title="Edit user"
                        aria-label={`Edit user ${u.username}`}
                      >
                        <Pencil size={18} />
                      </Link>

                      <Delete
                        iconOnly
                        title="Delete user"
                        text={
                          <span>
                            Delete user <strong>{u.username}</strong>?
                          </span>
                        }
                        successMessage="User deleted"
                        errorMessage="Failed to delete user"
                        onDelete={async () => {
                          await DELETE_USER({ variables: { userId: u.user_id } })
                          await refetch()
                        }}
                        className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                      />
                    </div>
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