//control/src/pages/users/CreateUser.tsx

import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { useNavigate } from "react-router-dom"

const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    createUser(
      username: $username
      email: $email
      password: $password
      role: $role
    ) {
      user_id
      email
      role
    }
  }
`

type Role = "admin" | "frontdesk" | "mechanic"

type FormState = {
  username: string
  email: string
  password: string
  role: Role
}

export default function CreateUser() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    role: "admin",
  })

  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      alert("✅ User created successfully")
      navigate("/users")
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: name === "role" ? (value as Role) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createUser({ variables: form })
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-gray-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700"
          aria-label="Role"
        >
          <option value="admin">Admin</option>
          <option value="frontdesk">Frontdesk</option>
          <option value="mechanic">Mechanic</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
        {error && (
          <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
        )}
      </form>
    </div>
  )
}
