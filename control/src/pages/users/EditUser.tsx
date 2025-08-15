// control/src/pages/users/EditUser.tsx

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { GET_USER, GET_USERS } from "@/graphql/queries/getUsers"
import { UPDATE_USER } from "@/graphql/mutations/updateUser"

const roles = ["admin", "frontdesk", "mechanic"] as const
type Role = typeof roles[number]

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const navigate = useNavigate()

  const { data, loading: qLoading, error: qError } = useQuery(GET_USER, {
    variables: { userId: uid },
    skip: !uid,
    fetchPolicy: "cache-and-network",
  })

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "frontdesk" as Role,
    password: "",
  })
  const [errors, setErrors] = useState<{ email?: string; username?: string }>({})
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null)

  const [updateUser, { loading: mLoading }] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    onCompleted: () => {
      setToast({ type: "success", msg: "Usuario actualizado" })
      setTimeout(() => navigate("/users", { replace: true }), 700)
    },
    onError: (err) => {
      const msg = err.message || "Fallo al actualizar"
      if (/unique|duplicate|already exists/i.test(msg)) {
        setErrors((e) => ({ ...e, email: "Email ya está en uso" }))
      }
      setToast({ type: "error", msg })
    },
  })

  useEffect(() => {
    if (data?.user) {
      const u = data.user
      setForm({
        username: u.username ?? "",
        email: u.email ?? "",
        role: (u.role || "frontdesk") as Role,
        password: "",
      })
    }
  }, [data])

  const validate = () => {
    const e: typeof errors = {}
    if (!form.username.trim()) e.username = "Obligatorio"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email no válido"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return

    await updateUser({
      variables: {
        userId: uid,
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password || undefined,
      },
    })
  }

  if (!uid) return <div className="p-6 text-red-400">ID de usuario inválido.</div>
  if (qError) return <div className="p-6 text-red-400">Error: {qError.message}</div>

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Editar usuario</h1>

      <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block mb-1 text-sm text-gray-300">Username</label>
          <input
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="Ingrese el nombre de usuario"
            title="Nombre de usuario"
            required
          />
          {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 text-sm text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={form.email || ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Ingrese el correo electrónico"
            title="Correo electrónico"
            required
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Rol</label>
          <select
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            title="Seleccione el rol del usuario"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Password (opcional)</label>
          <input
            type="password"
            placeholder="Dejar vacío para no cambiar"
            title="Contraseña (opcional)"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mLoading || qLoading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
          >
            {mLoading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Cancelar
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
