// control/src/pages/vehicles/Vehicles.tsx

import { useQuery, useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { DELETE_VEHICLE } from "@/graphql/mutations/deleteVehicle"
import { Car, Pencil, Trash2, Plus } from "lucide-react"

export default function Vehicles() {
  const { data, loading, error, refetch } = useQuery(GET_VEHICLES)

  const [deleteVehicle] = useMutation(DELETE_VEHICLE, {
    onCompleted: () => {
      refetch() // actualiza la lista después de borrar
    },
    onError: (error) => {
      alert("Failed to delete vehicle: " + error.message)
    },
  })

  const handleDelete = (vehicleId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vehicle?")
    if (confirmDelete) {
      deleteVehicle({ variables: { vehicleId } })
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car size={28} />
          Vehicles
        </h1>
        <Link
          to="/vehicles/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          title="Add vehicle"
          aria-label="Add vehicle"
        >
          <Plus size={20} />
          Add Vehicle
        </Link>
      </div>

      {loading && <p className="text-gray-400">Loading vehicles...</p>}
      {error && (
        <p className="text-red-500">
          Error loading vehicles: {error.message}
        </p>
      )}

      {!loading && data?.vehicles?.length === 0 && (
        <p className="text-gray-400">No vehicles found.</p>
      )}

      {!loading && data?.vehicles?.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-gray-800 rounded-lg">
            <thead>
              <tr className="bg-gray-700 text-left">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Make</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">VIN</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.vehicles.map((v: any) => (
                <tr
                  key={v.vehicle_id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-2">
                    {v.client
                      ? `${v.client.first_name} ${v.client.last_name}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">{v.make}</td>
                  <td className="px-4 py-2">{v.model}</td>
                  <td className="px-4 py-2">{v.year}</td>
                  <td className="px-4 py-2">{v.license_plate}</td>
                  <td className="px-4 py-2">{v.vin}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link
                      to={`/vehicles/edit/${v.vehicle_id}`}
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Edit vehicle"
                      aria-label="Edit vehicle"
                    >
                      <Pencil size={18} />
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-400"
                      title="Delete vehicle"
                      aria-label="Delete vehicle"
                      onClick={() => handleDelete(v.vehicle_id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
