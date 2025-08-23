import { useQuery, useMutation } from "@apollo/client"
import { Link } from "react-router-dom"
import { GET_CLIENTS } from "@/graphql/queries/getClients"
import { DELETE_CLIENT } from "@/graphql/mutations/deleteClient"
import { Users, Pencil, Plus, Car } from "lucide-react"
import { useState } from "react"
import Delete from "@/components/common/Delete"

function fullClientName(c: any) {
  if (c.type === "COMPANY") return c.company_name ?? "—"
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "—"
}

function vehiclesPreview(c: any) {
  const arr = c.vehicles ?? []
  if (arr.length === 0) return <span className="text-zinc-400">—</span>
  const first = arr[0]
  const more = arr.length - 1
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1">
        <Car size={16} className="text-zinc-300" />
        <span className="text-zinc-200">
          {first.make} {first.model} · {first.license_plate}
        </span>
      </span>
      {more > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
          +{more}
        </span>
      )}
    </div>
  )
}

type ClientTypeFilter = "PERSONAL" | "COMPANY" | null

export default function Clients() {
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>(null)

  const { data, loading, error, refetch } = useQuery(GET_CLIENTS, {
    variables: { type: typeFilter },
    fetchPolicy: "cache-and-network",
  })

  const [runDelete] = useMutation(DELETE_CLIENT)

  return (
    <div className="p-6 text-white max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Users size={26} />
          Clients
        </h1>
        <Link
          to="/clients/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
          aria-label="Add client"
          title="Add client"
        >
          <Plus size={18} />
          Add Client
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {([
          { label: "All", value: null },
          { label: "Personal", value: "PERSONAL" as const },
          { label: "Company", value: "COMPANY" as const },
        ] as const).map((t) => {
          const active = typeFilter === t.value
          return (
            <button
              key={t.label}
              onClick={() => setTypeFilter(t.value)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-xl border text-sm transition ${
                active
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60"
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">Loading clients…</div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-800 bg-red-900/30 p-4 text-red-200">
          Error loading clients: {error.message}
        </div>
      )}

      {!loading && !error && (!data?.clients || data.clients.length === 0) && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <p className="text-zinc-300 mb-3">No clients found.</p>
          <Link
            to="/clients/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus size={18} />
            Add your first client
          </Link>
        </div>
      )}

      {!loading && !error && data?.clients?.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900">
          <table className="min-w-full">
            <thead>
              <tr className="text-left bg-zinc-800/60">
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Type</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Contact</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Country</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300">Vehicles</th>
                <th className="px-4 py-3 text-sm font-medium text-zinc-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.map((c: any, idx: number) => {
                const isLast = idx === data.clients.length - 1
                const typeBadge =
                  c.type === "COMPANY" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 border border-amber-800 text-amber-200">
                      COMPANY
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 border border-emerald-800 text-emerald-200">
                      PERSONAL
                    </span>
                  )

                return (
                  <tr
                    key={c.client_id}
                    className={`border-b border-zinc-800 hover:bg-zinc-800/40 transition ${isLast ? "last:border-b-0" : ""}`}
                  >
                    <td className="px-4 py-2">{fullClientName(c)}</td>
                    <td className="px-4 py-2">{typeBadge}</td>
                    <td className="px-4 py-2">
                      <div className="text-zinc-200">{c.email || "—"}</div>
                      <div className="text-xs text-zinc-400">{c.phone || ""}</div>
                    </td>
                    <td className="px-4 py-2">{c.country || "—"}</td>
                    <td className="px-4 py-2">{vehiclesPreview(c)}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          to={`/clients/${c.client_id}/edit`}
                          className="inline-flex text-amber-400 hover:text-amber-300"
                          title="Edit client"
                          aria-label={`Edit client ${fullClientName(c)}`}
                        >
                          <Pencil size={18} />
                        </Link>

                        <Delete
                          iconOnly
                          title="Delete client"
                          text="This action cannot be undone. Do you want to delete this client?"
                          successMessage="Client deleted"
                          errorMessage="Failed to delete client"
                          onDelete={async () => {
                            await runDelete({ variables: { clientId: c.client_id } })
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