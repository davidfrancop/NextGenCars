// control/src/pages/vehicles/Vehicles.tsx

import { useQuery, useMutation } from "@apollo/client"
import { Link, useNavigate } from "react-router-dom"
import { useState, useCallback, useRef, useEffect } from "react"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { DELETE_VEHICLE } from "@/graphql/mutations/deleteVehicle"
import { CarFront, Pencil, Trash2, Plus } from "lucide-react"

function Toast({ kind = "success", msg }: { kind?: "success" | "error"; msg: string }) {
  const isError = kind === "error"
  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-xl shadow-lg text-sm z-50 ${
        isError ? "bg-red-700/90" : "bg-emerald-700/90"
      }`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      {msg}
    </div>
  )
}

function ConfirmDialog({
  open,
  title,
  text,
  onCancel,
  onConfirm,
}: {
  open: boolean
  title: string
  text: string
  onCancel: () => void
  onConfirm: () => void
}) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) {
      // focus inicial para accesibilidad
      cancelRef.current?.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-text"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} role="presentation" />
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-xl">
        <h3 id="confirm-title" className="text-lg font-semibold mb-2">
          {title}
        </h3>
        <p id="confirm-text" className="text-sm text-zinc-300 mb-4">
          {text}
        </p>
        <div className="flex justify-end gap-2">
          <button
            ref={cancelRef}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Vehicles() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useQuery(GET_VEHICLES)

  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null)
  const [confirm, setConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })

  const [deleteVehicle, { loading: deleting }] = useMutation(DELETE_VEHICLE, {
    onCompleted: async () => {
      await refetch()
      setToast({ kind: "success", msg: "Vehicle deleted" })
      setTimeout(() => setToast(null), 1200)
    },
    onError: (err) => {
      setToast({ kind: "error", msg: err.message || "Failed to delete vehicle" })
      setTimeout(() => setToast(null), 2000)
    },
  })

  const askDelete = useCallback((vehicleId: number) => {
    setConfirm({ open: true, id: vehicleId })
  }, [])

  const doDelete = useCallback(() => {
    if (confirm.id == null) return
    deleteVehicle({ variables: { vehicleId: confirm.id } })
    setConfirm({ open: false, id: null })
  }, [confirm.id, deleteVehicle])

  const closeConfirm = useCallback(() => setConfirm({ open: false, id: null }), [])

  if (loading) {
    return (
      <div className="p-6 text-white max-w-6xl mx-auto">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300" role="status" aria-live="polite">
          Loading vehicles…
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-white max-w-6xl mx-auto">
        <div className="rounded-2xl border border-red-800 bg-red-900/30 p-4 text-red-200" role="alert" aria-live="assertive">
          Error loading vehicles: {error.message}
        </div>
      </div>
    )
  }

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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
          aria-label="Add vehicle"
          title="Add vehicle"
        >
          <Plus size={18} />
          Add Vehicle
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
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">Client</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">Make</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">Model</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">Year</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">Plate</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300">VIN</th>
                <th scope="col" className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any, idx: number) => {
                const isLast = idx === vehicles.length - 1
                const clientName =
                  (v.client?.company_name ??
                    [v.client?.first_name, v.client?.last_name].filter(Boolean).join(" ")) || "—"
                const plate = v.plate ?? v.license_plate
                return (
                  <tr
                    key={v.vehicle_id}
                    className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition ${isLast ? "last:border-b-0" : ""}`}
                    onClick={() => navigate(`/vehicles/${v.vehicle_id}/edit`)} // ← ruta correcta
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        navigate(`/vehicles/${v.vehicle_id}/edit`)
                      }
                    }}
                    aria-label={`Edit vehicle ${plate}`}
                  >
                    <td className="px-4 py-2">{clientName}</td>
                    <td className="px-4 py-2">{v.make}</td>
                    <td className="px-4 py-2">{v.model}</td>
                    <td className="px-4 py-2">{v.year}</td>
                    <td className="px-4 py-2">{plate}</td>
                    <td className="px-4 py-2">{v.vin}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          to={`/vehicles/${v.vehicle_id}/edit`} // ← corregido (no /dashboard ni /vehicles/edit/:id)
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex text-amber-400 hover:text-amber-300"
                          title="Edit vehicle"
                          aria-label={`Edit vehicle ${plate}`}
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                          title="Delete vehicle"
                          aria-label={`Delete vehicle ${plate}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            askDelete(v.vehicle_id)
                          }}
                          disabled={deleting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete vehicle"
        text="This action cannot be undone. Do you want to delete this vehicle?"
        onCancel={closeConfirm}
        onConfirm={doDelete}
      />

      {toast && <Toast kind={toast.kind} msg={toast.msg} />}
    </div>
  )
}
