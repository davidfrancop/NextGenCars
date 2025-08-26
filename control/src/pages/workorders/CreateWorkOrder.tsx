import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLazyQuery, useMutation, useQuery, gql } from "@apollo/client"
import { CREATE_WORK_ORDER } from "@/graphql/mutations/createWorkOrder"

type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
type Status = "OPEN" | "IN_PROGRESS" | "ON_HOLD" | "CLOSED" | "CANCELED"

type ClientLite = {
  client_id: number
  type: "PERSONAL" | "COMPANY"
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  email?: string | null
}

type VehicleLite = {
  vehicle_id: number
  make: string
  model: string
  license_plate: string
}

/** ───────────────── GraphQL (read-only helpers) ───────────────── **/
const SEARCH_CLIENTS_LOCAL = gql`
  query SearchClients($type: ClientType, $search: String, $take: Int, $skip: Int) {
    clients(type: $type, search: $search, take: $take, skip: $skip) {
      client_id
      type
      first_name
      last_name
      company_name
      email
    }
  }
`

const GET_CLIENT_BY_ID_LOCAL = gql`
  query GetClientById($client_id: Int!) {
    client(client_id: $client_id) {
      client_id
      type
      first_name
      last_name
      company_name
      email
    }
  }
`

const GET_CLIENT_VEHICLES_LOCAL = gql`
  query GetClientVehicles($client_id: Int!) {
    client(client_id: $client_id) {
      client_id
      vehicles {
        vehicle_id
        make
        model
        license_plate
      }
    }
  }
`

/** ───────────────────── UI helpers (same look & feel) ───────────────────── **/
function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: "default" | "green" | "amber" | "red" | "blue"
}) {
  const map: Record<string, string> = {
    default: "bg-zinc-900 border border-zinc-800 text-zinc-300",
    green: "bg-emerald-900/30 border border-emerald-800 text-emerald-300",
    amber: "bg-amber-900/30 border border-amber-800 text-amber-300",
    red: "bg-rose-900/30 border border-rose-800 text-rose-300",
    blue: "bg-blue-900/30 border border-blue-800 text-blue-300",
  }
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${map[tone]}`}>{children}</span>
}

function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200 tracking-wide">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}

function toneForStatus(s?: string | null): "default" | "green" | "amber" | "red" | "blue" {
  switch (s) {
    case "OPEN": return "blue"
    case "IN_PROGRESS": return "amber"
    case "ON_HOLD": return "red"
    case "CLOSED": return "green"
    case "CANCELED": return "red"
    default: return "default"
  }
}
function toneForPriority(p?: string | null): "default" | "green" | "amber" | "red" | "blue" {
  switch (p) {
    case "LOW": return "green"
    case "MEDIUM": return "blue"
    case "HIGH": return "amber"
    case "URGENT": return "red"
    default: return "default"
  }
}

function displayClientName(c?: ClientLite | null) {
  if (!c) return ""
  if (c.type === "COMPANY") return c.company_name || `Company #${c.client_id}`
  const full = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()
  return full || `Client #${c.client_id}`
}

function vehicleLabel(v: VehicleLite) {
  const mm = [v.make, v.model].filter(Boolean).join(" ")
  return [mm, v.license_plate].filter(Boolean).join(" • ") || `Vehicle #${v.vehicle_id}`
}

/** ─────────────────────────── Component ─────────────────────────── **/
const STATUS_OPTIONS: Status[] = ["OPEN", "IN_PROGRESS", "ON_HOLD", "CLOSED", "CANCELED"]
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"]

// Unified Task type
type TaskItem = { id: string; label: string; done: boolean; notes?: string }

export default function CreateWorkOrder() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preIdParam = params.get("clientId")
  const preClientId = preIdParam ? Number(preIdParam) : null

  // selections
  const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null)
  const [pickerOpen, setPickerOpen] = useState<boolean>(!preClientId)
  const [vehicles, setVehicles] = useState<VehicleLite[]>([])
  const [vehicleId, setVehicleId] = useState<string>("")

  // order fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<Status>("OPEN")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [assignedUserId, setAssignedUserId] = useState<string>("") // optional

  // schedule fields
  const [scheduledStart, setScheduledStart] = useState<string>("") // datetime-local
  const [scheduledEnd, setScheduledEnd] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // cost/context
  const [kmAtService, setKmAtService] = useState<string>("")
  const [estimatedCost, setEstimatedCost] = useState<string>("")
  const [totalCost, setTotalCost] = useState<string>("")

  // tasks (checklist → unified JSON)
  const [tasks, setTasks] = useState<TaskItem[]>([])

  const addTask = () =>
    setTasks((t) => [...t, { id: `t-${Date.now()}`, label: "", done: false }])
  const updateTask = (idx: number, patch: Partial<TaskItem>) =>
    setTasks((t) => t.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const removeTask = (idx: number) =>
    setTasks((t) => t.filter((_, i) => i !== idx))

  // mutation
  const [createWorkOrder, { loading: creating, error: createErr }] = useMutation(CREATE_WORK_ORDER, {
    onCompleted: () => navigate("/workorders", { replace: true }),
  })

  /** Prefill client if ?clientId= */
  const { data: preClientData } = useQuery(GET_CLIENT_BY_ID_LOCAL, {
    variables: { client_id: preClientId ?? 0 },
    skip: !preClientId,
  })
  useEffect(() => {
    if (preClientId && preClientData?.client) {
      const c = preClientData.client
      setSelectedClient({
        client_id: c.client_id,
        type: c.type,
        first_name: c.first_name,
        last_name: c.last_name,
        company_name: c.company_name,
        email: c.email,
      })
      setPickerOpen(false)
    }
  }, [preClientId, preClientData])

  /** Typeahead search (clients) */
  const [term, setTerm] = useState("")
  const [skip, setSkip] = useState(0)
  const TAKE = 20
  const [searchClients, { data: searchData, loading: searching, fetchMore }] = useLazyQuery(SEARCH_CLIENTS_LOCAL, {
    fetchPolicy: "network-only",
  })
  const debTimer = useRef<number | null>(null)
  useEffect(() => {
    if (!pickerOpen) return
    if (debTimer.current) window.clearTimeout(debTimer.current)
    debTimer.current = window.setTimeout(() => {
      setSkip(0)
      searchClients({ variables: { type: null, search: term || null, take: TAKE, skip: 0 } })
    }, 250)
    return () => { if (debTimer.current) window.clearTimeout(debTimer.current) }
  }, [term, pickerOpen, searchClients])
  const results: ClientLite[] = useMemo(() => searchData?.clients ?? [], [searchData])
  const loadMore = () => {
    const nextSkip = skip + TAKE
    setSkip(nextSkip)
    fetchMore?.({
      variables: { type: null, search: term || null, take: TAKE, skip: nextSkip },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        return { clients: [...(prev?.clients ?? []), ...(fetchMoreResult.clients ?? [])] }
      },
    })
  }

  /** Load vehicles for selected client */
  const [loadVehicles, { data: cvData, loading: loadingVehicles }] = useLazyQuery(GET_CLIENT_VEHICLES_LOCAL)
  useEffect(() => {
    if (!selectedClient) return
    setVehicleId("")
    setVehicles([])
    loadVehicles({ variables: { client_id: selectedClient.client_id } })
  }, [selectedClient, loadVehicles])
  useEffect(() => {
    const list: VehicleLite[] = cvData?.client?.vehicles ?? []
    setVehicles(list)
    if (list.length === 1) setVehicleId(String(list[0].vehicle_id))
  }, [cvData])

  /** Submit */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    if (!vehicleId) return
    if (!title.trim()) return

    const cleanedTasks = tasks
      .map((t) => ({
        id: t.id,
        label: t.label.trim(),
        done: !!t.done,
        ...(t.notes && t.notes.trim() ? { notes: t.notes.trim() } : {}),
      }))
      .filter((t) => t.label.length > 0)

    const input = {
      client_id: selectedClient.client_id,
      vehicle_id: Number(vehicleId),
      assigned_user_id: assignedUserId.trim() ? Number(assignedUserId) : null,
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
      scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      km_at_service: kmAtService.trim() ? Number(kmAtService) : null,
      estimated_cost: estimatedCost.trim() ? Number(estimatedCost) : null,
      total_cost: totalCost.trim() ? Number(totalCost) : null,
      tasks: cleanedTasks.length ? cleanedTasks : null,
    }

    createWorkOrder({ variables: { input } })
  }

  /** ───────────────────────────── UI ───────────────────────────── **/
  return (
    <div className="p-6 space-y-4" id="wo-create-sheet">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Create Work Order</h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge tone={toneForStatus(status)}>{status}</Badge>
            <Badge tone={toneForPriority(priority)}>{priority}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/workorders")}
            className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="wo-create-form"
            disabled={creating}
            className="rounded-xl border border-blue-800/60 bg-blue-900/30 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-900/40 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* Client picker */}
      <Section title="Client">
        {!pickerOpen && selectedClient ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div>
              <div className="text-xs text-gray-400">Selected client</div>
              <div className="font-medium">{displayClientName(selectedClient)}</div>
              {selectedClient.email && <div className="text-xs text-gray-400">{selectedClient.email}</div>}
            </div>
            <button
              type="button"
              className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700"
              onClick={() => setPickerOpen(true)}
              aria-label="Change client"
            >
              Change
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 p-3">
            <label className="block text-sm mb-2" htmlFor="client-search">Select client</label>
            <input
              id="client-search"
              placeholder="Type name, company, email, DNI/VAT..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800"
              aria-label="Search clients"
            />
            <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-zinc-800">
              {searching && <div className="p-2 text-sm text-gray-400">Searching...</div>}
              {!searching && results.length === 0 && <div className="p-2 text-sm text-gray-400">No results</div>}
              {results.map((c) => (
                <button
                  key={c.client_id}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-zinc-800 border-b border-zinc-800"
                  onClick={() => {
                    setSelectedClient(c)
                    setPickerOpen(false)
                  }}
                >
                  <div className="font-medium">{displayClientName(c)}</div>
                  <div className="text-xs text-gray-400">
                    {c.type} {c.email ? `· ${c.email}` : ""}
                  </div>
                </button>
              ))}
              {results.length >= TAKE && (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm text-gray-300 hover:bg-zinc-800"
                  onClick={loadMore}
                >
                  Load more…
                </button>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Vehicle of selected client */}
      <Section title="Vehicle">
        <label htmlFor="vehicle_id" className="block text-xs text-zinc-400 mb-1">Vehicle</label>
        <select
          id="vehicle_id"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          disabled={!selectedClient || loadingVehicles}
          required
        >
          <option value="">{loadingVehicles ? "Loading…" : "— Select vehicle —"}</option>
          {vehicles.map((v) => (
            <option key={v.vehicle_id} value={v.vehicle_id}>
              {vehicleLabel(v)}
            </option>
          ))}
        </select>
        {selectedClient && vehicles.length === 0 && !loadingVehicles && (
          <p className="text-xs text-gray-400 mt-1">This client has no vehicles yet.</p>
        )}
      </Section>

      {/* Worksheet form */}
      <form id="wo-create-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order */}
          <Section title="Order">
            <div className="space-y-3">
              <div>
                <label htmlFor="title" className="block text-xs text-zinc-400 mb-1">Title *</label>
                <input
                  id="title"
                  placeholder="e.g. Oil change + general check"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  id="description"
                  placeholder="Optional notes…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="status" className="block text-xs text-zinc-400 mb-1">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="assigned_user_id" className="block text-xs text-zinc-400 mb-1">Assigned user (id)</label>
                  <input
                    id="assigned_user_id"
                    type="number"
                    min={1}
                    placeholder="Optional"
                    value={assignedUserId}
                    onChange={(e) => setAssignedUserId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="km_at_service" className="block text-xs text-zinc-400 mb-1">KM at service</label>
                <input
                  id="km_at_service"
                  type="number"
                  min={0}
                  placeholder="e.g. 68000"
                  value={kmAtService}
                  onChange={(e) => setKmAtService(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            </div>
          </Section>

          {/* Client (read-only preview) */}
          <Section title="Client (preview)">
            <div className="space-y-2 text-sm text-zinc-100">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-xs text-zinc-400">Name / Company</div>
                <div className="font-medium">{displayClientName(selectedClient)}</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-xs text-zinc-400">Email</div>
                <div>{selectedClient?.email ?? "—"}</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-xs text-zinc-400">Type</div>
                <div>{selectedClient?.type ?? "—"}</div>
              </div>
            </div>
          </Section>

          {/* Vehicle (read-only preview) */}
          <Section title="Vehicle (preview)">
            <div className="space-y-2 text-sm text-zinc-100">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="text-xs text-zinc-400">Vehicle</div>
                <div>
                  {(() => {
                    const v = vehicles.find((vv) => String(vv.vehicle_id) === vehicleId)
                    return v ? vehicleLabel(v) : "—"
                  })()}
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Schedule + Costs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Schedule">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="scheduled_start" className="block text-xs text-zinc-400 mb-1">Scheduled start</label>
                <input
                  id="scheduled_start"
                  type="datetime-local"
                  value={scheduledStart}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="scheduled_end" className="block text-xs text-zinc-400 mb-1">Scheduled end</label>
                <input
                  id="scheduled_end"
                  type="datetime-local"
                  value={scheduledEnd}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="start_date" className="block text-xs text-zinc-400 mb-1">Start</label>
                <input
                  id="start_date"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-xs text-zinc-400 mb-1">End</label>
                <input
                  id="end_date"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            </div>
          </Section>

          <Section title="Costs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="estimated_cost" className="block text-xs text-zinc-400 mb-1">Estimated (€)</label>
                <input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="e.g. 120.00"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="total_cost" className="block text-xs text-zinc-400 mb-1">Total (€)</label>
                <input
                  id="total_cost"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="e.g. 150.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
              </div>
            </div>
          </Section>
        </div>

        {/* Tasks */}
        <Section title="Tasks (checklist)">
          <div className="space-y-2">
            {tasks.length === 0 && (
              <div className="text-sm text-zinc-400">No tasks yet.</div>
            )}
            {tasks.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => updateTask(i, { done: e.target.checked })}
                  aria-label={`Task ${i + 1} done`}
                />
                <input
                  value={t.label}
                  onChange={(e) => updateTask(i, { label: e.target.value })}
                  placeholder={`Task #${i + 1}`}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => removeTask(i)}
                  className="rounded-xl border border-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                  aria-label={`Remove task ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTask}
              className="mt-2 rounded-xl border border-zinc-800 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Add task
            </button>
          </div>
        </Section>

        {createErr && (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-rose-400 text-sm">
            {createErr.message.includes("Vehicle does not belong")
              ? "Selected vehicle does not belong to this client."
              : createErr.message}
          </div>
        )}
      </form>
    </div>
  )
}