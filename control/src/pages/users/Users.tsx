// control/src/pages/users/Users.tsx

import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, gql } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { Users as UsersIcon, UserCog, Pencil, Trash2, Plus } from "lucide-react"

type Role = "admin" | "frontdesk" | "mechanic"
type User = {
  user_id: number
  username: string
  email: string
  role: Role
  created_at: string | null
}

// Local mutation (puedes moverla a /graphql/mutations/deleteUser.ts si prefieres)
const DELETE_USER = gql`
  mutation DeleteUser($user_id: Int!) {
    deleteUser(user_id: $user_id) {
      user_id
    }
  }
`

/* ---------- Shared UI bits (idénticos a Clients.tsx) ---------- */
function Toast({ kind = "success", msg }: { kind?: "success" | "error"; msg: string }) {
  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-xl shadow-lg text-sm z-50 ${
        kind === "success" ? "bg-emerald-700/90" : "bg-red-700/90"
      }`}
      role="status"
    >
      {msg}
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  text,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  text: string
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-zinc-300 mb-4">{text}</p>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Helpers ---------- */
function roleBadge(role: Role) {
  const map: Record<Role, string> = {
    admin: "bg-violet-900/40 border-violet-800 text-violet-200",
    frontdesk: "bg-sky-900/40 border-sky-800 text-sky-200",
    mechanic: "bg-emerald-900/40 border-emerald-800 text-emerald-200",
  }
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[role]}`}>{role.toUpperCase()}</span>
}

type RoleFilter = Role | null

export default function Users() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(null)

  const { data, loading, error, refetch } = useQuery<{ users: User[] }>(GET_USERS, {
    fetchPolicy: "cache-and-network",
  })

  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null)
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
  })

  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    onCompleted: async () => {
      await refetch()
      setToast({ kind: "success", msg: "User deleted" })
      setTimeout(() => setToast(null), 1200)
    },
    onError: (err) => {
      setToast({ kind: "error", msg: err.message || "Failed to delete user" })
      setTimeout(() => setToast(null), 2000)
    },
  })

  const openConfirm = (userId: number, username?: string) => setConfirm({ open: true, id: userId, name: username })
  const closeConfirm = () => setConfirm({ open: false, id: null, name: "" })
  const doDelete = () => {
    if (confirm.id == null) return
    deleteUser({ variables: { user_id: confirm.id } })
    closeConfirm()
  }

  const users = useMemo(() => data?.users ?? [], [data])

  const filteredUsers: User[] = useMemo(() => {
    if (!roleFilter) return users
    return users.filter((u) => u.role === roleFilter)
  }, [users, roleFilter])

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <UserCog size={26} />
          Users
        </h1>
        <Link
          to="/users/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
          aria-label="Add user"
          title="Add user"
        >
          <Plus size={18} />
          Add User
        </Link>
      </div>

      {/* Tabs filtro: All / Admin / Frontdesk / Mechanic */}
      <div className="mb-4 flex items-center gap-2">
        {(
          [
            { label: "All", value: null },
            { label: "Admin", value: "admin" as const },
            { label: "Frontdesk", value: "frontdesk" as const },
            { label: "Mechanic", value: "mechanic" as const },
          ] as const
        ).map((t) => {
          const active = roleFilter === t.value
          return (
            <button
              key={t.label}
              onClick={() => setRoleFilter(t.value)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                active
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* States */}
      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Loading users…</div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-800 bg-red-900/30 p-4 text-red-200">
          Error loading users: {error.message}
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-300 mb-3">No users found.</p>
          <Link
            to="/users/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus size={18} />
            Add your first user
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-zinc-800/60">
                {/* 🔻 ID eliminado para seguir el patrón visual de Clients */}
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Username</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Email</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Role</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => {
                const isLast = idx === filteredUsers.length - 1
                return (
                  <tr
                    key={u.user_id}
                    className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition ${
                      isLast ? "last:border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">
                      <div className="text-zinc-200">{u.email || "—"}</div>
                    </td>
                    <td className="px-4 py-2">{roleBadge(u.role)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/users/${u.user_id}/edit`}
                          className="inline-flex text-amber-400 hover:text-amber-300"
                          title={`Edit user ${u.username}`}
                          aria-label={`Edit user ${u.username}`}
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                          title={`Delete user ${u.username}`}
                          aria-label={`Delete user ${u.username}`}
                          onClick={() => openConfirm(u.user_id, u.username)}
                          disabled={deleting}
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

      {/* Confirm + Toast */}
      <ConfirmDialog
        open={confirm.open}
        title="Delete user"
        text={`This action cannot be undone. Do you want to delete ${confirm.name ?? "this user"}?`}
        onCancel={closeConfirm}
        onConfirm={doDelete}
      />
      {toast && <Toast kind={toast.kind} msg={toast.msg} />}
    </div>
  )
}
