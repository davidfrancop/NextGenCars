// src/pages/clients/EditClient.tsx
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function EditClient() {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
  })

  useEffect(() => {
    // Simular fetch de datos (reemplazar por query real)
    setTimeout(() => {
      setForm({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "123456789",
        country: "Germany",
      })
    }, 300)
  }, [clientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("✏️ Updating client:", clientId, form)
    setTimeout(() => {
      alert("Client updated!")
      navigate("/clients")
    }, 500)
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <input
          name="country"
          value={form.country}
          onChange={handleChange}
          placeholder="Country"
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Update Client
        </button>
      </form>
    </div>
  )
}
