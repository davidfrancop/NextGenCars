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

function ToastView({ kind = "success", msg }: { kind?: "success" | "error"; msg: string }) {
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

export default function CreateUser() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "frontdesk" as Role,
    password: "",
  })
  const [errors, setErrors] = useState<{ username?: string; email?: string; role?: string; password?: string }>({})
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast>(null)

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])

  const [createUser, { loading, error: saveError }] = useMutation(CREATE_USER, {
    // Mantenemos consistencia con EditClient/EditUser
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
    onCompleted() {
      setToast({ type: "success", msg: "User created" })
      setTimeout(() => navigate("/users"), 850)
    },
    onError(err) {
      const msg = err?.message || "Could not create the user."
      if (/(ya está en uso|already.*in use|unique constraint)/i.test(msg)) {
        setErrors((e) => ({ ...e, email: "This email is already in use." }))
      }
      setErr(msg)
      setToast({ type: "error", msg })
      setTimeout(() => setToast(null), 2000)
    },
  })

  function validate() {
    const e: typeof errors = {}
    if (!form.username.trim() || form.username.trim().length < 3) e.username = "At least 3 characters."
    if (!emailRegex.test(form.email)) e.email = "Invalid email format."
    if (!roles.includes(form.role)) e.role = "Invalid role."
    if (form.password.length < 6) e.password = "At least 6 characters."
    setErrors(e)
    setErr(Object.keys(e).length ? "Please fix the highlighted fields." : null)
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

  // Título del navegador
  useEffect(() => {
    document.title = "Create · User · NextGen Cars"
  }, [])

  return (
    <div className="max-w-2xl">
      {/* Header con botón Back */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 p-2"
          title="Back"
          aria-label="Back"
          disabled={loading}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold">Create User</h1>
      </div>

      {(err || saveError) && (
        <div className="mb-3 rounded-xl bg-red-800/40 border border-red-700 px-3 py-2 text-sm" role="alert">
          {err || saveError?.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3" noValidate>
        {/* Username */}
        <div>
          <label className="block text-sm mb-1" htmlFor="username">Username *</label>
          <input
            id="username"
            className={`w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border ${
              errors.username ? "border-red-500" : "border-transparent"
            }`}
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, username: e.target.value.trim() }))}
            disabled={loading}
            placeholder="john.doe"
            autoComplete="username"
            type="text"
            inputMode="text"
            maxLength={60}
            required
          />
          {errors.username && <p className="text-xs text-red-400 mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email *</label>
          <input
            id="email"
            className={`w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border ${
              errors.email ? "border-red-500" : "border-transparent"
            }`}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            onBlur={(e) => setForm((f) => ({ ...f, email: e.target.value.trim() }))}
            disabled={loading}
            placeholder="john@acme.com"
            type="email"
            inputMode="email"
            maxLength={120}
            autoComplete="email"
            required
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm mb-1" htmlFor="role">Role *</label>
          <select
            id="role"
            className={`w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border ${
              errors.role ? "border-red-500" : "border-transparent"
            }`}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            disabled={loading}
            title="Select user role"
            aria-label="Role"
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

        {/* Password */}
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Password *</label>
          <input
            id="password"
            className={`w-full rounded-xl bg-zinc-900 px-3 py-2 outline-none border ${
              errors.password ? "border-red-500" : "border-transparent"
            }`}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            disabled={loading}
            type="password"
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            maxLength={128}
            required
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 disabled:opacity-60"
          >
            <Check size={18} />
            {loading ? "Creating..." : "Create user"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/users")}
            className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      {toast && <ToastView kind={toast.type} msg={toast.msg} />}
    </div>
  )
}
