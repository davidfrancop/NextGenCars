//control/src/pages/workorders/EditWorkOrder.tsx

import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@apollo/client"
import { GET_WORK_ORDER } from "@/graphql/queries/getWorkOrder"
import { UPDATE_WORK_ORDER } from "@/graphql/mutations/updateWorkOrder"
import { GET_WORK_ORDERS } from "@/graphql/queries/getWorkOrders"
import { useEffect, useState } from "react"

export default function EditWorkOrder() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data, loading, error } = useQuery(GET_WORK_ORDER, {
    variables: { id: Number(id) },
  })
  const [updateWO, { loading: saving, error: saveError }] = useMutation(UPDATE_WORK_ORDER, {
    refetchQueries: [{ query: GET_WORK_ORDERS }],
  })

  const [form, setForm] = useState<any>({
    client_id: "",
    vehicle_id: "",
    title: "",
    tasks: [],
  })

  useEffect(() => {
    if (data?.workOrder) {
      const w = data.workOrder
      setForm({
        client_id: w.client_id,
        vehicle_id: w.vehicle_id,
        title: w.title ?? "",
        tasks: w.tasks ?? [],
      })
    }
  }, [data])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = {
      client_id: Number(form.client_id),
      vehicle_id: Number(form.vehicle_id),
      title: form.title || undefined,
      tasks: form.tasks,
    }
    await updateWO({ variables: { id: Number(id), input } })
    nav("/workorders")
  }

  if (loading) return <p className="p-6 text-gray-300">Loading…</p>
  if (error) return <p className="p-6 text-red-500">Error: {error.message}</p>

  return (
    <div className="p-6 text-white max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Edit Work Order #{id}</h1>

      {saveError && <p className="text-red-400 mb-3">Error: {saveError.message}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Client ID</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.client_id}
            onChange={(e) => setForm((f:any) => ({ ...f, client_id: e.target.value }))}
            placeholder="Enter client ID"
            title="Client ID"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Vehicle ID</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.vehicle_id}
            onChange={(e) => setForm((f:any) => ({ ...f, vehicle_id: e.target.value }))}
            placeholder="Enter vehicle ID"
            title="Vehicle ID"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.title}
            onChange={(e) => setForm((f:any) => ({ ...f, title: e.target.value }))}
            title="Title"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tasks (JSON array)</label>
          <textarea
            className="w-full h-40 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm"
            value={JSON.stringify(form.tasks || [], null, 2)}
            onChange={(e) => {
              try { setForm((f:any) => ({ ...f, tasks: JSON.parse(e.target.value) })) }
              catch { /* no-op */ }
            }}
            title="Tasks"
            placeholder='Enter tasks as a JSON array, e.g. [{"desc":"Change oil"}]'
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => nav("/workorders")}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
