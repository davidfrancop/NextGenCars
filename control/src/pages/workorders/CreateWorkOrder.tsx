//control/src/pages/workorders/CreateWorkOrder.tsx

import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { CREATE_WORK_ORDER } from "@/graphql/mutations/createWorkOrder"
import { GET_WORK_ORDERS } from "@/graphql/queries/getWorkOrders"
import { useState } from "react"

export default function CreateWorkOrder() {
  const nav = useNavigate()
  const [form, setForm] = useState<any>({
    client_id: "",
    vehicle_id: "",
    title: "",
    tasks: [],
  })

  const [createWO, { loading, error }] = useMutation(CREATE_WORK_ORDER, {
    refetchQueries: [{ query: GET_WORK_ORDERS }],
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = {
      client_id: Number(form.client_id),
      vehicle_id: Number(form.vehicle_id),
      title: form.title || undefined,
      tasks: form.tasks,
    }
    await createWO({ variables: { input } })
    nav("/workorders")
  }

  return (
    <div className="p-6 text-white max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Create Work Order</h1>

      {error && <p className="text-red-400 mb-3">Error: {error.message}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Client ID</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.client_id}
            onChange={(e) => setForm((f:any) => ({ ...f, client_id: e.target.value }))}
            placeholder="e.g. 4"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Vehicle ID</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.vehicle_id}
            onChange={(e) => setForm((f:any) => ({ ...f, vehicle_id: e.target.value }))}
            placeholder="e.g. 11"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            value={form.title}
            onChange={(e) => setForm((f:any) => ({ ...f, title: e.target.value }))}
            placeholder="Cambio de aceite"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tasks (JSON array)</label>
          <textarea
            className="w-full h-40 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-sm"
            value={JSON.stringify(form.tasks || [], null, 2)}
            onChange={(e) => {
              try {
                setForm((f:any) => ({ ...f, tasks: JSON.parse(e.target.value) }))
              } catch { /* evita romper mientras tipeas */ }
            }}
            placeholder='[{"code":"OIL","desc":"Aceite 5W30","qty":1,"price":60}]'
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create"}
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
