// src/pages/clients/CreateClient.tsx
import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { useState } from "react"
import { CREATE_CLIENT } from "@/graphql/mutations/createClient"

export default function CreateClient() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    type: "personal",
  })

  const [createClient, { loading, error }] = useMutation(CREATE_CLIENT, {
    onCompleted: () => {
      alert("✅ Client created!")
      navigate("/clients")
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createClient({ variables: { ...form } })
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
          aria-label="First Name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          aria-label="Last Name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          aria-label="Email"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          aria-label="Phone"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="Country"
          aria-label="Country"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          aria-label="Client Type"
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="personal">Personal</option>
          <option value="company">Company</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Client"}
        </button>

        {error && <p className="text-red-500 mt-2">{error.message}</p>}
      </form>
    </div>
  )
}
