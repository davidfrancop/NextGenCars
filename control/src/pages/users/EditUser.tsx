// control/src/pages/users/EditUser.tsx

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { GET_USER, GET_USERS } from "@/graphql/queries/getUsers"
import { UPDATE_USER } from "@/graphql/mutations/updateUser"

const roles = ["admin", "frontdesk", "mechanic"] as const
type Role = typeof roles[number]
type Toast = { type: "success" | "error"; msg: string } | null

export default function EditUser() {
  const { id: idParam, userId: userIdParam } = useParams<{ id?: string; userId?: string }>()
  const uid = Number(idParam ?? userIdParam)
  const isValidId = Number.isInteger(uid) && uid > 0
  const navigate = useNavigate()

  const { data, loading: qLoading, error: qError } = useQuery(GET_USER, {
    variables: { userId: uid },
    skip: !isValidId,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  })

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "frontdesk" as Role,
    password: "",
  })
  const [errors, setErrors] = useState<{ username?: string; email?: string; role?: string; password?: string }>({})
  const [toast, setToast] = useState<Toast>(null)

  useEffect(() => {
    if (data?.user) {
      const u = data.user
      setForm({
        username: u.username ?? "",
        email: u.email ?? "",
        role: (u.role as Role) ?? "frontdesk",
        password: "",
      })
    }
  }, [data])

  const [updateUser, { loading: mLoading }] = useMutation(UPDATE_USER, {
    errorPolicy: "all",
    update(cache, { data }) {
      const updated = data?.updateUser
      if (!updated) return
      const existing = cache.readQuery<{ users: any[] }>({ query: GET_USERS })
      if (!existing?.users) return
      cache.writeQuery({
        query: GET_USERS,
        data: { users: existing.users.map((u) => (u.user_id === updated.user_id ? { ...u, ...updated } : u)) },
      })
    },
    onCompleted() {
      setToast({ type: "success", msg: "User updated successfully." })
      setTimeout(() => {
        setToast(null)
        navigate("/users")
      }, 900)
    },
    onError(err) {
      const msg = err?.message || "Could not update the user."
      if (/(ya está en uso|already.*in use)/i.test(msg)) {
        setErrors((e) => ({ ...e, email: "This email is already in use." }))
      }
      setToast({ type: "error", msg })
      setTimeout(() => setToast(null), 1800)
    },
  })

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])

  function validate() {
    const e: typeof errors = {}
    if (!form.username.trim() || form.username.trim().length < 3) e.username = "At least 3 characters."
    if (!emailRegex.test(form.email)) e.email = "Invalid email format."
    if (!roles.includes(form.role)) e.role = "Invalid role."
    if (form.password && form.password.length < 6) e.password = "At least 6 characters."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    await updateUser({
      variables: {
        userId: uid,
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password ? form.password : null,
      },
    })
  }

  if (!isValidId) return <div className="p-6 text-red-400">Invalid user ID.</div>
  if (qLoading) return <div className="p-6 text-gray-300">Loading user…</div>
  if (qError) return <div className="p-6 text-red-400">Error loading user.</div>
  if (!data?.user) return <div className="p-6 text-gray-300">User not found.</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit User</h1>

      <form onSubmit={onSubmit} className="space-y-5 bg-gray-800 rounded-xl p-6 shadow">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.username ? "border-red-500" : "border-transparent"}`}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            disabled={mLoading}
            placeholder="john.doe"
          />
          {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.email ? "border-red-500" : "border-transparent"}`}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={mLoading}
            placeholder="john@acme.com"
            type="email"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="role-select" className="block text-sm mb-1">Role</label>
          <select
            id="role-select"
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.role ? "border-red-500" : "border-transparent"}`}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            disabled={mLoading}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password (optional)</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.password ? "border-red-500" : "border-transparent"}`}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            disabled={mLoading}
            type="password"
            placeholder="Leave empty to keep current"
            autoComplete="new-password"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 disabled:opacity-60"
          >
            {mLoading ? "Saving…" : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/users")}
            className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2"
            disabled={mLoading}
          >
            Cancel
          </button>
        </div>
      </form>

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
