// control/src/pages/workorders/WorkOrders.tsx

import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@apollo/client"
import { GET_WORK_ORDERS } from "@/graphql/queries/getWorkOrders"

type Client = {
  client_id: number
  type?: "PERSONAL" | "COMPANY" | null
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
}

type Vehicle = {
  vehicle_id: number
  make?: string | null
  model?: string | null
  license_plate?: string | null
}

type User = {
  user_id: number
  username: string
  role: "admin" | "frontdesk" | "mechanic"
}

type WorkOrder = {
  work_order_id: number
  title?: string | null
  status?: string | null
  priority?: string | null
  created_at?: string | null
  scheduled_start?: string | null
  total_cost?: number | null
  client?: Client | null
  vehicle?: Vehicle | null
  assigned_user?: User | null
}

type WorkOrderFilter = {
  q?: string | null
  status?: string | null
  priority?: string | null
  clientId?: number | null
  vehicleId?: number | null
}

const TAKE = 10

function fullClientName(c?: Client | null) {
  if (!c) return "—"
  if (c.company_name && c.company_name.trim()) return c.company_name
  const fn = c.first_name?.trim() || ""
  const ln = c.last_name?.trim() || ""
  return [fn, ln].filter(Boolean).join(" ") || "—"
}

function vehicleLabel(v?: Vehicle | null) {
  if (!v) return "—"
  const mm = [v.make, v.model].filter(Boolean).join(" ")
  return [mm, v.license_plate].filter(Boolean).join(" • ") || "—"
}

function euro(n?: number | null) {
  if (n == null) return "—"
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n)
}

function dateShort(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString()
}

/** ===== Badges (same style language as Clients Type) ===== */
function StatusBadge({ value }: { value?: string | null }) {
  const v = (value || "").toUpperCase()
  // palette: use *-900/40 bg + *-800 border + *-200 text (dark)
  const map: Record<string, string> = {
    OPEN: "bg-emerald-900/40 border-emerald-800 text-emerald-200",
    IN_PROGRESS: "bg-indigo-900/40 border-indigo-800 text-indigo-200",
    ON_HOLD: "bg-amber-900/40 border-amber-800 text-amber-200",
    CLOSED: "bg-zinc-800/60 border-zinc-700 text-zinc-200",
    CANCELED: "bg-rose-900/40 border-rose-800 text-rose-200",
  }
  const cls = map[v] || "bg-zinc-800/60 border-zinc-700 text-zinc-200"
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}
      aria-label={`Status ${v || "unknown"}`}
    >
      {v || "—"}
    </span>
  )
}

function PriorityBadge({ value }: { value?: string | null }) {
  const v = (value || "").toUpperCase()
  const map: Record<string, string> = {
    LOW: "bg-zinc-800/60 border-zinc-700 text-zinc-200",
    MEDIUM: "bg-sky-900/40 border-sky-800 text-sky-200",
    HIGH: "bg-orange-900/40 border-orange-800 text-orange-200",
    URGENT: "bg-red-900/40 border-red-800 text-red-200",
  }
  const cls = map[v] || "bg-zinc-800/60 border-zinc-700 text-zinc-200"
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}
      aria-label={`Priority ${v || "unknown"}`}
    >
      {v || "—"}
    </span>
  )
}

export default function WorkOrders() {
  const [params, setParams] = useSearchParams()
  const initialQ = params.get("q") || ""
  const initialPage = Math.max(1, parseInt(params.get("page") || "1", 10))

  const [q, setQ] = useState(initialQ)
  const [page, setPage] = useState(initialPage)

  const skip = (page - 1) * TAKE

  const filter: WorkOrderFilter = useMemo(
    () => ({
      q: q.trim() ? q.trim() : null,
    }),
    [q]
  )

  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDERS, {
    variables: { filter, skip, take: TAKE },
    fetchPolicy: "cache-and-network",
  })

  const items: WorkOrder[] = data?.workOrders?.items ?? []
  const total: number = data?.workOrders?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / TAKE))

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    if (q.trim()) next.set("q", q.trim())
    else next.delete("q")
    next.set("page", "1")
    setParams(next, { replace: true })
    setPage(1)
    refetch({ filter: { q: q.trim() || null }, skip: 0, take: TAKE })
  }

  const goPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages)
    setPage(clamped)
    const next = new URLSearchParams(params)
    next.set("page", String(clamped))
    if (q.trim()) next.set("q", q.trim()); else next.delete("q")
    setParams(next, { replace: true })
    refetch({ filter, skip: (clamped - 1) * TAKE, take: TAKE })
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Work Orders</h1>
        <Link
          to="/workorders/create"
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          New Work Order
        </Link>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by number, title, client, vehicle…"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search work orders"
        />
        <button
          type="submit"
          className="rounded-md border px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100/60 dark:bg-zinc-800/60">
            <tr className="text-zinc-600 dark:text-zinc-300">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Vehicle</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Scheduled</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-3" colSpan={10}>Loading…</td>
              </tr>
            )}
            {error && (
              <tr>
                <td className="px-3 py-3 text-rose-600" colSpan={10}>
                  Failed to load work orders: {error.message}
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td className="px-3 py-3" colSpan={10}>No results</td>
              </tr>
            )}

            {items.map((wo) => (
              <tr key={wo.work_order_id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2 font-mono">{wo.work_order_id}</td>
                <td className="px-3 py-2">{wo.title || "—"}</td>
                <td className="px-3 py-2">{fullClientName(wo.client)}</td>
                <td className="px-3 py-2">{vehicleLabel(wo.vehicle)}</td>
                <td className="px-3 py-2">
                  <StatusBadge value={wo.status} />
                </td>
                <td className="px-3 py-2">
                  <PriorityBadge value={wo.priority} />
                </td>
                <td className="px-3 py-2">{dateShort(wo.created_at)}</td>
                <td className="px-3 py-2">{dateShort(wo.scheduled_start)}</td>
                <td className="px-3 py-2">{euro(wo.total_cost)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/workorders/${wo.work_order_id}`}
                      className="rounded-md border px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800"
                    >
                      Open Order
                    </Link>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-zinc-500">
          Page {page} / {totalPages} • {total} results
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
