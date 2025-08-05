// src/pages/users/EditUser.tsx

import { useQuery, useMutation } from "@apollo/client"
import { GET_USERS } from "@/graphql/queries/getUsers"
import { UPDATE_USER } from "@/graphql/mutations/updateUser"
import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

interface FormData {
  username: string
  email: string
  role: string
  password: string
}

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    role: "",
    password: "",
  })

  const { data, loading, error } = useQuery(GET_USERS)
  const [updateUser] = useMutation(UPDATE_USER)

  useEffect(() => {
    if (data?.users && userId) {
      const user = data.users.find((u: any) => u.user_id === parseInt(userId))
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          role: user.role,
          password: "",
        })
      }
    }
  }, [data, userId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      await updateUser({
        variables: {
          userId: parseInt(userId),
          username: formData.username,
          email: formData.email,
          role: formData.role,
          password: formData.password || null,
        },
      })
      navigate("/users")
    } catch (err) {
      console.error("Error updating user:", err)
    }
  }

  if (loading) return <p className="text-center text-gray-400">Loading user...</p>
  if (error) return <p className="text-center text-red-500">Error loading user.</p>

  return (
    <div className="p-6 text-white max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit User</h2>

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

        <div>
          <label htmlFor="password" className="block text-sm mb-1 text-gray-300">
            New Password (optional)
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Leave empty to keep current password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-900 border border-gray-600"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
