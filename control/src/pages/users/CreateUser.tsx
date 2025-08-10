// src/pages/users/CreateUser.tsx

import { useMutation } from "@apollo/client"
import { CREATE_USER } from "@/graphql/mutations/createUser"
import { GET_USERS } from "@/graphql/queries/getUsers" // 🔹 para refetch
import { useNavigate } from "react-router-dom"
import { useState } from "react"

interface FormData {
  username: string
  email: string
  password: string
  role: string
}

export default function CreateUser() {
  const navigate = useNavigate()
  const [createUser] = useMutation(CREATE_USER)

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    role: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createUser({
        variables: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        // 🔹 Esto refresca la lista en Users.tsx
        refetchQueries: [{ query: GET_USERS }],
      })

      navigate("/users")
    } catch (err) {
      console.error("Error creating user:", err)
    }
  }

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-6 rounded-lg shadow"
      >
        <div>
          <label htmlFor="username" className="block text-sm mb-1 text-gray-300">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm mb-1 text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1 text-gray-300">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm mb-1 text-gray-300">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600"
            required
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="frontdesk">Frontdesk</option>
            <option value="mechanic">Mechanic</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition"
        >
          Create User
        </button>
      </form>
    </div>
  )
}
