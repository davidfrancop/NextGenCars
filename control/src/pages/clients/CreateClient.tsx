// src/pages/clients/CreateClient.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CreateClient() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Aquí se enviaría a GraphQL
    console.log("📦 Saving client:", { firstName, lastName, email, phone, country })

    // Simulación
    setTimeout(() => {
      alert("Client created!")
      navigate("/clients")
    }, 500)
  }

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">New Client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="First name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Country"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Save Client
        </button>
      </form>
    </div>
  )
}
