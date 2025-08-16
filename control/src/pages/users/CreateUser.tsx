// control/src/pages/users/CreateUser.tsx

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { ArrowLeft, Check } from "lucide-react"
import { CREATE_USER } from "@/graphql/mutations/createUser"
import { GET_USERS } from "@/graphql/queries/getUsers"

const roles = ["admin", "frontdesk", "mechanic"] as const
type Role = typeof roles[number]
type Toast = { type: "success" | "error"; msg: string } | null

export default function CreateUser() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "frontdesk" as Role,
    password: "",
  })
  const [errors, setErrors] = useState<{ username?: string; email?: string; role?: string; password?: string }>({})
  const [toast, setToast] = useState<Toast>(null)

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    errorPolicy: "all",
    update(cache, { data }) {
      const created = data?.createUser
      if (!created) return
      const existing = cache.readQuery<{ users: any[] }>({ query: GET_USERS })
      if (!existing?.users) {
        cache.writeQuery({ query: GET_USERS, data: { users: [created] } })
      } else {
        cache.writeQuery({
          query: GET_USERS,
          data: { users: [created, ...existing.users] },
        })
      }
    },
    onCompleted() {
      setToast({ type: "success", msg: "User created successfully." })
      setTimeout(() => {
        setToast(null)
        navigate("/users")
      }, 900)
    },
    onError(err) {
      const msg = err?.message || "Could not create the user."
      if (/(ya está en uso|already.*in use)/i.test(msg)) {
        setErrors((e) => ({ ...e, email: "This email is already in use." }))
      }
      setToast({ type: "error", msg })
      setTimeout(() => setToast(null), 1800)
    },
  })

  function validate() {
    const e: typeof errors = {}
    if (!form.username.trim() || form.username.trim().length < 3) e.username = "At least 3 characters."
    if (!emailRegex.test(form.email)) e.email = "Invalid email format."
    if (!roles.includes(form.role)) e.role = "Invalid role."
    if (form.password.length < 6) e.password = "At least 6 characters."
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    await createUser({
      variables: {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      },
    })
  }

  // Quick access: ESC to go back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [navigate])

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header with Back button */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 p-2"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">Create User</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 bg-gray-800 rounded-xl p-6 shadow">
        {/* Username */}
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.username ? "border-red-500" : "border-transparent"}`}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            disabled={loading}
            placeholder="john.doe"
          />
          {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.email ? "border-red-500" : "border-transparent"}`}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            disabled={loading}
            placeholder="john@acme.com"
            type="email"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.role ? "border-red-500" : "border-transparent"}`}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            disabled={loading}
            title="Select user role"
            aria-label="Role"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className={`w-full rounded-lg bg-gray-900 px-3 py-2 outline-none border ${errors.password ? "border-red-500" : "border-transparent"}`}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            disabled={loading}
            type="password"
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 disabled:opacity-60"
          >
            <Check size={18} />
            {loading ? "Creating…" : "Create User"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/users")}
            className="rounded-lg bg-gray-700 hover:bg-gray-600 px-4 py-2"
            disabled={loading}
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
