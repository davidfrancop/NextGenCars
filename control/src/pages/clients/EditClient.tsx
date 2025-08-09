// src/pages/clients/EditClient.tsx
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { GET_CLIENT_BY_ID } from "@/graphql/queries/getClientById"
import { UPDATE_CLIENT } from "@/graphql/mutations/updateClient"

export default function EditClient() {
  const { clientId } = useParams()
  const navigate = useNavigate()

  const { data, loading, error } = useQuery(GET_CLIENT_BY_ID, {
    variables: { client_id: Number(clientId) },
    skip: !clientId,
  })

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    type: "personal",
  })

  useEffect(() => {
    if (data?.client) {
      const { first_name, last_name, email, phone, country, type } = data.client
      setForm({
        first_name: first_name ?? "",
        last_name: last_name ?? "",
        email: email ?? "",
        phone: phone ?? "",
        country: country ?? "",
        type: type ?? "personal",
      })
    }
  }, [data])

  const [updateClient, { loading: saving, error: saveError }] = useMutation(UPDATE_CLIENT, {
    onCompleted: () => {
      alert("✅ Client updated!")
      navigate("/clients")
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateClient({
      variables: {
        client_id: Number(clientId),
        ...form,
      },
    })
  }

  if (loading) return <p className="text-gray-400 p-6">Loading client...</p>
  if (error) return <p className="text-red-500 p-6">Error: {error.message}</p>

  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Client</h2>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {saveError && <p className="text-red-500 mt-2">{saveError.message}</p>}
      </form>
    </div>
  )
}
