// control/src/pages/vehicles/CreateVehicle.tsx

import { useMutation, useQuery } from "@apollo/client"
import { CREATE_VEHICLE } from "@/graphql/mutations/createVehicle"
import { GET_PERSONAL_CLIENTS } from "@/graphql/queries/getPersonalClients"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CreateVehicle() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    client_id: "",
    make: "",
    model: "",
    year: "",
    plate: "",
    vin: "",
  })

  const { data: clientsData } = useQuery(GET_PERSONAL_CLIENTS)
  const [createVehicle, { loading, error }] = useMutation(CREATE_VEHICLE)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createVehicle({
        variables: {
          ...formData,
          client_id: parseInt(formData.client_id),
          year: parseInt(formData.year),
        },
      })
      navigate("/vehicles")
    } catch (err) {
      console.error("Error creating vehicle:", err)
    }
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <select
          name="client_id"
          value={formData.client_id}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          title="Client"
          aria-label="Client"
        >
          <option value="">Select Client</option>
          {clientsData?.personalClients.map((c: any) => (
            <option key={c.client_id} value={c.client_id}>
              {c.first_name} {c.last_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="make"
          placeholder="Make"
          title="Make"
          aria-label="Make"
          value={formData.make}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <input
          type="text"
          name="model"
          placeholder="Model"
          title="Model"
          aria-label="Model"
          value={formData.model}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <input
          type="number"
          name="year"
          placeholder="Year"
          title="Year"
          aria-label="Year"
          value={formData.year}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <input
          type="text"
          name="plate"
          placeholder="License Plate"
          title="License Plate"
          aria-label="License Plate"
          value={formData.plate}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <input
          type="text"
          name="vin"
          placeholder="VIN"
          title="VIN"
          aria-label="VIN"
          value={formData.vin}
          onChange={handleChange}
          required
          className="w-full p-2 rounded bg-gray-800 border border-gray-600"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={loading}
          title="Save vehicle"
          aria-label="Save vehicle"
        >
          {loading ? "Saving..." : "Save Vehicle"}
        </button>

        {error && (
          <p className="text-red-500 mt-2" role="alert">
            Error: {error.message}
          </p>
        )}
      </form>
    </div>
  )
}
