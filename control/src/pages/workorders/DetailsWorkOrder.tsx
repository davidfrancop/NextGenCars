import { useParams, Link } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { GET_WORK_ORDER } from "@/graphql/queries/getWorkOrder"

export default function DetailsWorkOrder() {
  const { id } = useParams()
  const { data, loading, error } = useQuery(GET_WORK_ORDER, {
    variables: { id: Number(id) },
  })

  if (loading) return <p className="p-6 text-gray-300">Loading…</p>
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>
  const w = data?.workOrder
  if (!w) return <p className="p-6 text-gray-300">Not found.</p>

  return (
    <div className="p-6 text-white max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Work Order #{w.work_order_id}</h1>
        <Link
          to={`/workorders/${w.work_order_id}/edit`}
          className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-500"
        >
          Edit
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="Title" value={w.title ?? "—"} />
        <Info label="Status" value={w.status} />
        <Info label="Priority" value={w.priority ?? "—"} />
        <Info label="Client" value={
          w.client?.company_name ||
          [w.client?.first_name, w.client?.last_name].filter(Boolean).join(" ") || "—"
        } />
        <Info label="Vehicle" value={
          w.vehicle ? `${w.vehicle.make} ${w.vehicle.model} (${w.vehicle.license_plate})` : "—"
        } />
        <Info label="Assigned" value={w.assigned_user?.username ?? "—"} />
        <Info label="Estimated" value={w.estimated_cost != null ? `€ ${w.estimated_cost}` : "—"} />
        <Info label="Total" value={w.total_cost != null ? `€ ${w.total_cost}` : "—"} />
        <Info label="Start" value={w.start_date ?? "—"} />
        <Info label="End" value={w.end_date ?? "—"} />
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Tasks</h2>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 overflow-auto text-sm">
          {JSON.stringify(w.tasks ?? [], null, 2)}
        </pre>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium break-words">{String(value)}</div>
    </div>
  )
}
