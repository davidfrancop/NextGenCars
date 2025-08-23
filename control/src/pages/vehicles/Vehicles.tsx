// control/src/pages/vehicles/Vehicles.tsx

import { useQuery, useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { DELETE_VEHICLE } from "@/graphql/mutations/deleteVehicle"
import { CarFront, Pencil, Plus } from "lucide-react"
import Delete from "@/components/common/Delete"

export default function Vehicles() {
  const { data, loading, error, refetch } = useQuery(GET_VEHICLES)
  const [deleteVehicle] = useMutation(DELETE_VEHICLE)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  const vehicles = data?.vehicles ?? []

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <CarFront size={26} />
          Vehicles
        </h1>
        <Link
          to="/vehicles/create"
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          aria-label="New Vehicle"
          title="New Vehicle"
        >
          <Plus size={16} />
          New Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-300 mb-3">No vehicles found.</p>
          <Link
            to="/vehicles/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus size={18} />
            Add your first vehicle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-zinc-800/60">
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Client</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Make</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Model</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Year</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Plate</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">VIN</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any, idx: number) => {
                const isLast = idx === vehicles.length - 1
                const clientName =
                  v.client?.company_name ||
                  [v.client?.first_name, v.client?.last_name].filter(Boolean).join(" ") ||
                  "—"
                const plate = v.plate ?? v.license_plate

                return (
                  <tr
                    key={v.vehicle_id}
                    className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition ${
                      isLast ? "last:border-b-0" : ""
                    }`}
                  >
                    <td className="px-4 py-2">{clientName}</td>
                    <td className="px-4 py-2">{v.make}</td>
                    <td className="px-4 py-2">{v.model}</td>
                    <td className="px-4 py-2">{v.year}</td>
                    <td className="px-4 py-2">{plate}</td>
                    <td className="px-4 py-2">{v.vin}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        {/* ✏️ Solo ícono (igual Clients/Users) */}
                        <Link
                          to={`/vehicles/${v.vehicle_id}/edit`}
                          className="inline-flex text-amber-400 hover:text-amber-300"
                          title="Edit vehicle"
                          aria-label={`Edit vehicle ${plate}`}
                        >
                          <Pencil size={18} />
                        </Link>

                        {/* 🗑️ Delete genérico (iconOnly) */}
                        <Delete
                          iconOnly
                          title="Delete vehicle"
                          text="This action cannot be undone. Do you want to delete this vehicle?"
                          successMessage="Vehicle deleted"
                          errorMessage="Failed to delete vehicle"
                          onDelete={async () => {
                            await deleteVehicle({ variables: { vehicleId: v.vehicle_id } })
                            await refetch()
                          }}
                          className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}