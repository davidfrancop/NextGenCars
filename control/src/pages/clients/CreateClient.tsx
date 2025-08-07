// control/src/pages/clients/CreateClient.tsx

import { useState } from "react"
import { useMutation } from "@apollo/client"
import { useNavigate } from "react-router-dom"
import { CREATE_CLIENT } from "@/graphql/mutations/createClient"

export default function CreateClient() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const navigate = useNavigate()

  const [createClient] = useMutation(CREATE_CLIENT, {
    onCompleted: () => {
      alert("✅ Client created!")
      navigate("/clients")
    },
    onError: (error) => {
      alert("❌ Error: " + error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createClient({
      variables: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        country,
        type: "personal", // fijo por ahora
      },
    })
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
          title="First name"
          aria-label="First name"
        />
        <input
          type="text"
          placeholder="Last name"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          title="Last name"
          aria-label="Last name"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          title="Email"
          aria-label="Email"
        />
        <input
          type="tel"
          placeholder="Phone"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          title="Phone"
          aria-label="Phone"
        />
        <input
          type="text"
          placeholder="Country"
          className="w-full p-2 rounded bg-gray-700 text-white"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          title="Country"
          aria-label="Country"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          title="Save client"
          aria-label="Save client"
        >
          Save Client
        </button>
      </form>
    </div>
  )
}
