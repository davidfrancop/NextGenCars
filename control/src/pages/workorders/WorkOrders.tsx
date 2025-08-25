import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"
import { ClipboardList, Pencil, Eye, Plus } from "lucide-react"

import { GET_WORK_ORDERS } from "@/graphql/queries/getWorkOrders"
import { DELETE_WORK_ORDER } from "@/graphql/mutations/deleteWorkOrder"
import RoleGuard from "@/components/RoleGuard"
import Delete from "@/components/common/Delete"

type Row = {
  work_order_id: number
  title?: string | null
  status: "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "CLOSED" | "CANCELED"
  client?: {
    first_name?: string | null
    last_name?: string | null
    company_name?: string | null
  } | null
  vehicle?: {
    make: string
    model: string
    license_plate: string
  } | null
}

const TAKE = 20

export default function WorkOrders() {
  const [term, setTerm] = useState("")
  const [skip, setSkip] = useState(0)
  const [status, setStatus] = useState<string>("") // filtro simple

  const vars = useMemo(() => ({
    skip,
    take: TAKE,
    filter: {
      search: term.trim() ? term.trim() : null,
      status: status || null,
    },
  }), [skip, term, status])

  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: vars,
    fetchPolicy: "cache-and-network",
  })

  const [deleteWO] = useMutation(DELETE_WORK_ORDER)

  // debounce búsqueda
  const deb = useRef<number | null>(null)
  useEffect(() => {
    if (deb.current) window.clearTimeout(deb.current)
    deb.current = window.setTimeout(() => {
      setSkip(0)
      refetch(vars)
    }, 250) as any
    return () => { if (deb.current) window.clearTimeout(deb.current) }
  }, [term, status]) // eslint-disable-line react-hooks/exhaustive-deps

  const total: number = data?.workOrders?.total ?? 0
  const rows: Row[] = data?.workOrders?.items ?? []
  const page = Math.floor(skip / TAKE) + 1
  const pages = Math.max(1, Math.ceil(total / TAKE))

  const nextPage = () => setSkip((s) => Math.min(s + TAKE, Math.max(0, (pages - 1) * TAKE)))
  const prevPage = () => setSkip((s) => Math.max(0, s - TAKE))
  const resetPage = () => setSkip(0)

  const clientName = (r: Row) =>
    r.client?.company_name ||
    [r.client?.first_name, r.client?.last_name].filter(Boolean).join(" ") ||
    "—"

  const vehicleName = (r: Row) =>
    r.vehicle ? `${r.vehicle.make} ${r.vehicle.model} (${r.vehicle.license_plate})` : "—"

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ClipboardList size={26} />
          Work Orders
        </h1>

        {/* botón New solo para admin/frontdesk */}
        <RoleGuard allowed={["admin", "frontdesk"]}>
          <Link
            to="/workorders/create"
            className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          >
            <Plus size={16} />
            New Work Order
          </Link>
        </RoleGuard>
      </div>

      {/* filtros */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search (title, description)…"
          className="w-full sm:max-w-md px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          aria-label="Search work orders"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage() }}
          className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="ON_HOLD">ON_HOLD</option>
          <option value="CLOSED">CLOSED</option>
          <option value="CANCELED">CANCELED</option>
        </select>
      </div>

      {/* estados de carga */}
      {loading && <p className="text-gray-300">Loading…</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}

      {/* tabla */}
      {!error && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-zinc-800/60">
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Title</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Client</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Vehicle</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.work_order_id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                >
                  <td className="px-4 py-2">
                    <Link
                      to={`/workorders/${r.work_order_id}`}
                      className="text-indigo-300 hover:underline"
                    >
                      {r.title ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <StatusPill status={r.status} />
                  </td>
                  <td className="px-4 py-2">{clientName(r)}</td>
                  <td className="px-4 py-2">{vehicleName(r)}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center gap-3 justify-end">
                      {/* view */}
                      <Link
                        to={`/workorders/${r.work_order_id}`}
                        className="inline-flex text-blue-300 hover:text-blue-200"
                        title="View details"
                        aria-label={`View work order #${r.work_order_id}`}
                      >
                        <Eye size={18} />
                      </Link>

                      {/* edit: sólo admin/frontdesk */}
                      <RoleGuard allowed={["admin", "frontdesk"]}>
                        <Link
                          to={`/workorders/${r.work_order_id}/edit`}
                          className="inline-flex text-amber-400 hover:text-amber-300"
                          title="Edit work order"
                          aria-label={`Edit work order #${r.work_order_id}`}
                        >
                          <Pencil size={18} />
                        </Link>
                      </RoleGuard>

                      {/* delete: sólo admin/frontdesk */}
                      <RoleGuard allowed={["admin", "frontdesk"]}>
                        <Delete
                          iconOnly
                          title="Delete work order"
                          text="This action cannot be undone. Do you want to delete this work order?"
                          successMessage="Work order deleted"
                          errorMessage="Failed to delete work order"
                          onDelete={async () => {
                            await deleteWO({ variables: { id: r.work_order_id } }) // la mutación usa ($id) → work_order_id: $id
                            await refetch(vars)
                          }}
                          className="inline-flex text-red-500 hover:text-red-400 disabled:opacity-50"
                        />
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400">
                    No work orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* paginación */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-zinc-400">
          Page <span className="font-medium text-zinc-200">{page}</span> of{" "}
          <span className="font-medium text-zinc-200">{pages}</span> · Total{" "}
          <span className="font-medium text-zinc-200">{total}</span>
        </p>
        <div className="flex gap-2">
          <button
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            onClick={prevPage}
            disabled={skip === 0}
          >
            Prev
          </button>
          <button
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            onClick={nextPage}
            disabled={skip + TAKE >= total}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: Row["status"] }) {
  const map: Record<Row["status"], string> = {
    OPEN: "bg-emerald-900/40 text-emerald-300 border-emerald-800/60",
    IN_PROGRESS: "bg-amber-900/40 text-amber-300 border-amber-800/60",
    ON_HOLD: "bg-zinc-800/60 text-zinc-300 border-zinc-700/60",
    CLOSED: "bg-blue-900/40 text-blue-300 border-blue-800/60",
    CANCELED: "bg-rose-900/40 text-rose-300 border-rose-800/60",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${map[status]}`}>
      {status}
    </span>
  )
}
