// control/src/pages/vehicles/EditVehicle.tsx

import { useQuery, useMutation } from "@apollo/client"
import { GET_VEHICLE_BY_ID } from "@/graphql/queries/getVehicleById"
import { UPDATE_VEHICLE } from "@/graphql/mutations/updateVehicle"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"

export default function EditVehicle() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()

  const { data, loading: loadingQuery } = useQuery(GET_VEHICLE_BY_ID, {
    variables: { vehicle_id: Number(vehicleId) },
  })

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    plate: "",
    vin: "",
  })

  useEffect(() => {
    if (data?.vehicle) {
      const { make, model, year, plate, vin } = data.vehicle
      setFormData({ make, model, year: String(year), plate, vin })
    }
  }, [data])

  const [updateVehicle, { loading: loadingMutation, error }] =
    useMutation(UPDATE_VEHICLE)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateVehicle({
        variables: {
          vehicle_id: Number(vehicleId),
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year),
          plate: formData.plate,
          vin: formData.vin,
        },
      })
      navigate("/vehicles")
    } catch (err) {
      console.error("Error updating vehicle:", err)
    }
  }

  if (loadingQuery) return <p className="text-gray-400 p-6">Loading vehicle...</p>

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <input
          type="text"
          name="make"
          placeholder="Make"
          title="Make"
          aria-label="Make"
          value={formData.make}
          onChange={handleChange}
          required
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
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
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
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
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
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
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
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
          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={loadingMutation}
          title="Update vehicle"
          aria-label="Update vehicle"
        >
          {loadingMutation ? "Saving..." : "Update Vehicle"}
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
