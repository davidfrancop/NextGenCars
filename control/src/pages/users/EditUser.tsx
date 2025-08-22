// control/src/pages/users/EditUser.tsx

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { GET_USER, GET_USERS } from "@/graphql/queries/getUsers"
import { UPDATE_USER } from "@/graphql/mutations/updateUser"
import Toast, { type ToastState } from "@/components/common/Toast" // ✅ Toast común

const roles = ["admin", "frontdesk", "mechanic"] as const
type Role = typeof roles[number]

export default function EditUser() {
  // Soporta rutas /users/:id/edit o /users/:userId/edit
  const { id: idParam, userId: userIdParam } = useParams<{ id?: string; userId?: string }>()
  const uid = Number(idParam ?? userIdParam)
  const isValidId = Number.isInteger(uid) && uid > 0
  const navigate = useNavigate()

  const { data, loading: qLoading, error: qError } = useQuery(GET_USER, {
    variables: { userId: uid },
    skip: !isValidId,
    fetchPolicy: "cache-and-network",
  })

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "frontdesk" as Role,
    password: "",
  })

  // Errores por campo
  const [errors, setErrors] = useState<{ username?: string; email?: string; role?: string; password?: string }>({})
  // Error general
  const [err, setErr] = useState<string | null>(null)
  // ✅ Estado del Toast común
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    if (data?.user) {
      const u = data.user as { username?: string; email?: string; role?: string }
      setForm({
        username: u.username ?? "",
        email: u.email ?? "",
        role: (u.role as Role) ?? "frontdesk",
        password: "",
      })
    }
  }, [data])

  const [updateUser, { loading: saving, error: saveError }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setToast({ type: "success", msg: "User updated" })
      setTimeout(() => navigate("/users"), 850)
    },
    onError: (e) => {
      const msg = e?.message || "Failed to update user"
      if (/(ya está en uso|already.*in use|unique constraint)/i.test(msg)) {
        setErrors((cur) => ({ ...cur, email: "This email is already in use." }))
      }
      setErr(msg)
      setToast({ type: "error", msg })
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
    setErr(Object.keys(e).length ? "Please fix the highlighted fields." : null)
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

  const getTitle = () => (form.username.trim() ? form.username.trim() : `User #${uid}`)
  useEffect(() => {
    if (isValidId) document.title = `Edit · ${getTitle()} · NextGen Cars`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.username, uid, isValidId])

  if (!isValidId) return <div className="p-6 text-red-500">Invalid user ID.</div>
  if (qLoading) return <div className="p-6 text-zinc-300">Loading user...</div>
  if (qError) return <div className="p-6 text-red-500">Error: {qError.message}</div>
  if (!data?.user) return <div className="p-6 text-zinc-300">User not found.</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">{getTitle()}</h1>

      {(err || saveError) && (
        <div className="mb-3 rounded-xl bg-red-800/40 border border-red-700 px-3 py-2 text-sm" role="alert" aria-live="assertive">
          {err || saveError?.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3" noValidate>
        <div>
          <label className="block text-sm mb-1" htmlFor="username">Username *</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, username: e.target.value.trim() }))}
            className={`w-full px-3 py-2 rounded-xl bg-zinc-900 outline-none border ${
              errors.username ? "border-red-500" : "border-transparent"
            }`}
            placeholder="john.doe"
            autoComplete="username"
            type="text"
            inputMode="text"
            maxLength={60}
            disabled={saving}
            required
          />
          {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, email: e.target.value.trim() }))}
            className={`w-full px-3 py-2 rounded-xl bg-zinc-900 outline-none border ${
              errors.email ? "border-red-500" : "border-transparent"
            }`}
            placeholder="john@acme.com"
            autoComplete="email"
            type="email"
            inputMode="email"
            maxLength={120}
            disabled={saving}
            required
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="role-select">Role *</label>
          <select
            id="role-select"
            name="role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            className={`w-full px-3 py-2 rounded-xl bg-zinc-900 outline-none border ${
              errors.role ? "border-red-500" : "border-transparent"
            }`}
            disabled={saving}
            required
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
          <label className="block text-sm mb-1" htmlFor="password">Password (optional)</label>
          <input
            id="password"
            name="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className={`w-full px-3 py-2 rounded-xl bg-zinc-900 outline-none border ${
              errors.password ? "border-red-500" : "border-transparent"
            }`}
            type="password"
            placeholder="Leave empty to keep current"
            autoComplete="new-password"
            maxLength={128}
            disabled={saving}
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* ✅ Toast común */}
      {toast && (
        <Toast
          type={toast.type}
          msg={toast.msg}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}