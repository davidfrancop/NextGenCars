// control/src/pages/workorders/DetailsWorkOrder.tsx
// control/src/pages/workorders/DetailsWorkOrder.tsx

import { useNavigate, useParams } from "react-router-dom"
import { useQuery, useMutation } from "@apollo/client"
import { useEffect, useMemo, useState } from "react"
import { GET_WORK_ORDER } from "@/graphql/queries/getWorkOrder"
import { UPDATE_WORK_ORDER } from "@/graphql/mutations/updateWorkOrder"

type TaskItem = {
  id: string
  label: string
  done?: boolean
  notes?: string
}

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

function Section({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
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

function fmtDateToLocalInput(iso?: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}
function parseDateLocalToISO(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d.toISOString()
}
function euro(n?: number | null) {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(Number(n))
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

const STATUS_OPTIONS = ["OPEN", "IN_PROGRESS", "ON_HOLD", "CLOSED", "CANCELED"] as const
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

export default function DetailsWorkOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const wid = Number(id)

  const { data, loading, error, refetch } = useQuery(GET_WORK_ORDER, {
    variables: { work_order_id: wid }, // ✅ tu schema usa work_order_id: Int!
    skip: !Number.isFinite(wid),
    fetchPolicy: "cache-and-network",
  })

  const [updateWorkOrder, { loading: saving }] = useMutation(UPDATE_WORK_ORDER, {
    refetchQueries: [{ query: GET_WORK_ORDER, variables: { work_order_id: wid } }],
    awaitRefetchQueries: true,
  })

  const w = data?.workOrder

  // ---- Worksheet editable state ----
  const [status, setStatus] = useState<string>("")
  const [priority, setPriority] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [kmAtService, setKmAtService] = useState<string>("")
  const [estimated, setEstimated] = useState<string>("")
  const [total, setTotal] = useState<string>("")

  const [scheduledStart, setScheduledStart] = useState<string>("")
  const [scheduledEnd, setScheduledEnd] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // ---- Tasks: checklist (lee varios formatos, guarda estándar) ----
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [newTask, setNewTask] = useState<string>("")
  const [savedOk, setSavedOk] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Normaliza tasks del backend a [{id,label,done,notes}]
  function normalizeTasks(raw: any): TaskItem[] {
    const arr = Array.isArray(raw) ? raw : []
    return arr
      .map((t: any, i: number) => {
        const label =
          typeof t === "string"
            ? t
            : (t?.label ?? t?.name ?? t?.text ?? "") // 👈 soporte para {text,done} de Create
        const done = typeof t === "object" ? Boolean(t?.done) : false
        const notes = typeof t === "object" ? (t?.notes ?? "") : ""
        const id = String(t?.id ?? `t-${i}-${Math.random().toString(36).slice(2, 7)}`)
        return { id, label: String(label).trim(), done, notes }
      })
      .filter((t: TaskItem) => t.label.length > 0)
  }

  // Init desde servidor
  useEffect(() => {
    if (!w) return
    setStatus(w.status ?? "")
    setPriority(w.priority ?? "")
    setTitle(w.title ?? "")
    setDescription(w.description ?? "")
    setKmAtService(w.km_at_service != null ? String(w.km_at_service) : "")
    setEstimated(w.estimated_cost != null ? String(w.estimated_cost) : "")
    setTotal(w.total_cost != null ? String(w.total_cost) : "")

    setScheduledStart(fmtDateToLocalInput(w.scheduled_start))
    setScheduledEnd(fmtDateToLocalInput(w.scheduled_end))
    setStartDate(fmtDateToLocalInput(w.start_date))
    setEndDate(fmtDateToLocalInput(w.end_date))

    setTasks(normalizeTasks(w.tasks))
    setSavedOk(false)
    setFormError(null)
  }, [w])

  const statusBadge = useMemo(() => <Badge tone={toneForStatus(status)}>{status || "—"}</Badge>, [status])
  const priorityBadge = useMemo(() => <Badge tone={toneForPriority(priority)}>{priority || "—"}</Badge>, [priority])

  // ---- Tasks handlers ----
  const addTask = () => {
    const lbl = newTask.trim()
    if (!lbl) return
    setTasks((old) => [...old, { id: `t-${Date.now()}`, label: lbl, done: false }])
    setNewTask("")
  }
  const toggleTask = (id: string) => setTasks((old) => old.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const updateTaskLabel = (id: string, label: string) =>
    setTasks((old) => old.map((t) => (t.id === id ? { ...t, label } : t)))
  const updateTaskNotes = (id: string, notes: string) =>
    setTasks((old) => old.map((t) => (t.id === id ? { ...t, notes } : t)))
  const removeTask = (id: string) => setTasks((old) => old.filter((t) => t.id !== id))

  // ---- Save ----
  const onSave = async () => {
    setSavedOk(false)
    setFormError(null)

    // Validaciones simples
    const kmN = kmAtService.trim() === "" ? null : Number(kmAtService)
    if (kmN != null && (!Number.isInteger(kmN) || kmN < 0)) {
      setFormError("KM at service must be a non-negative integer")
      return
    }
    const estN = estimated.trim() === "" ? null : Number(estimated)
    const totN = total.trim() === "" ? null : Number(total)
    if ((estN != null && Number.isNaN(estN)) || (totN != null && Number.isNaN(totN))) {
      setFormError("Costs must be numeric")
      return
    }

    // PAYLOAD estándar para tasks
    const tasksPayload = tasks.map((t) => ({
      id: t.id,
      label: t.label.trim(),
      done: Boolean(t.done),
      ...(t.notes && t.notes.trim() ? { notes: t.notes.trim() } : {}),
    }))

    const input: any = {
      status: status || null,
      priority: priority || null,
      title: title.trim() || null,
      description: description.trim() || null,
      km_at_service: kmN,
      estimated_cost: estN,
      total_cost: totN,
      scheduled_start: parseDateLocalToISO(scheduledStart),
      scheduled_end: parseDateLocalToISO(scheduledEnd),
      start_date: parseDateLocalToISO(startDate),
      end_date: parseDateLocalToISO(endDate),
      tasks: tasksPayload, // 👈 siempre JSON estandarizado
    }

    await updateWorkOrder({
      variables: { work_order_id: wid, input },
      optimisticResponse: {
        updateWorkOrder: {
          __typename: "WorkOrder",
          work_order_id: wid,
          status,
          priority,
          title,
          description,
          km_at_service: kmN,
          estimated_cost: estN,
          total_cost: totN,
          scheduled_start: input.scheduled_start,
          scheduled_end: input.scheduled_end,
          start_date: input.start_date,
          end_date: input.end_date,
          tasks: tasksPayload,
          updated_at: new Date().toISOString(),
        },
      },
    })
    setSavedOk(true)
  }

  const printOnlyWorksheet = () => window.print()

  if (!Number.isFinite(wid)) return <div className="p-6 text-rose-400">Invalid work order id.</div>
  if (loading) return <div className="p-6 text-zinc-300">Loading…</div>
  if (error) return <div className="p-6 text-rose-400">Error: {error.message}</div>
  if (!w) return <div className="p-6 text-zinc-300">Not found.</div>

  return (
    <>
      {/* Print only the worksheet area */}
      <style>
        {`
          @media print {
            body * { visibility: hidden !important; }
            #wo-sheet, #wo-sheet * { visibility: visible !important; }
            #wo-sheet { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div id="wo-sheet" className="p-6 space-y-4">
        {/* Header / Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Work Order <span className="text-blue-400">#{w.work_order_id}</span>
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {statusBadge}
              {priorityBadge}
              <span className="text-xs text-zinc-400">
                Created: {new Date(w.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="no-print flex items-center gap-2">
            <button
              onClick={printOnlyWorksheet}
              className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Print
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl border border-blue-800/60 bg-blue-900/30 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-900/40 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => navigate("/workorders")}
              className="rounded-xl border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Back
            </button>
          </div>
        </div>

        {/* Workflow */}
        <Section
          title="Workflow"
          right={savedOk ? <span className="text-xs text-emerald-400">Saved</span> : <span className="text-xs text-zinc-500">Editable</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-xs text-zinc-400 mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-xs text-zinc-400 mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </Section>

        {/* Order */}
        <Section title="Order" right={<span className="text-xs text-zinc-500">Editable</span>}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wo-title" className="block text-xs text-zinc-400 mb-1">Title</label>
              <input
                id="wo-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="Short summary…"
              />
            </div>
            <div>
              <label htmlFor="wo-km" className="block text-xs text-zinc-400 mb-1">KM at service</label>
              <input
                id="wo-km"
                type="number"
                inputMode="numeric"
                min={0}
                value={kmAtService}
                onChange={(e) => setKmAtService(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. 86500"
              />
            </div>
            <div className="lg:col-span-2">
              <label htmlFor="wo-desc" className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea
                id="wo-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="Notes…"
              />
            </div>
          </div>

          {/* Client / Vehicle quick view (read-only) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-xs text-zinc-400">Client</div>
              <div className="text-sm text-zinc-100">
                {w.client?.company_name ||
                  [w.client?.first_name, w.client?.last_name].filter(Boolean).join(" ") || "—"}
              </div>
              <div className="text-xs text-zinc-400">{w.client?.email ?? "—"}</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <div className="text-xs text-zinc-400">Vehicle</div>
              <div className="text-sm text-zinc-100">
                {[w.vehicle?.make, w.vehicle?.model].filter(Boolean).join(" ")}
                {w.vehicle?.license_plate ? ` • ${w.vehicle.license_plate}` : ""}
              </div>
            </div>
          </div>
        </Section>

        {/* Schedule */}
        <Section title="Schedule" right={<span className="text-xs text-zinc-500">Editable</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Costs */}
        <Section title="Costs" right={<span className="text-xs text-zinc-500">Editable</span>}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="estimated_cost" className="block text-xs text-zinc-400 mb-1">Estimated</label>
              <input
                id="estimated_cost"
                type="number"
                inputMode="decimal"
                value={estimated}
                onChange={(e) => setEstimated(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. 250"
                step="0.01"
                min="0"
              />
              <div className="text-xs text-zinc-500 mt-1">Preview: {euro(estimated === "" ? null : Number(estimated))}</div>
            </div>
            <div>
              <label htmlFor="total_cost" className="block text-xs text-zinc-400 mb-1">Total</label>
              <input
                id="total_cost"
                type="number"
                inputMode="decimal"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                placeholder="e.g. 320"
                step="0.01"
                min="0"
              />
              <div className="text-xs text-zinc-500 mt-1">Preview: {euro(total === "" ? null : Number(total))}</div>
            </div>
          </div>
        </Section>

        {/* Tasks — Checklist */}
        <Section title="Tasks" right={<span className="text-xs text-zinc-500">Editable</span>}>
          {/* Add new task */}
          <div className="flex gap-2 mb-3">
            <label className="sr-only" htmlFor="new-task">New task</label>
            <input
              id="new-task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTask() }
              }}
              placeholder="Add task…"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
            <button
              type="button"
              onClick={addTask}
              className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              aria-label="Add task"
              title="Add task"
            >
              Add
            </button>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {tasks.length === 0 && <li className="text-sm text-zinc-400">No tasks yet.</li>}
            {tasks.map((t) => (
              <li key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex items-start gap-2">
                  <input
                    id={`chk-${t.id}`}
                    type="checkbox"
                    checked={Boolean(t.done)}
                    onChange={() => toggleTask(t.id)}
                    className="mt-1 h-4 w-4"
                    title="Mark as done"
                  />
                  <div className="w-full">
                    <label htmlFor={`chk-${t.id}`} className="sr-only">Done</label>
                    <input
                      aria-label="Task title"
                      value={t.label}
                      onChange={(e) => updateTaskLabel(t.id, e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      placeholder="Task title…"
                    />
                    <textarea
                      aria-label="Task notes"
                      value={t.notes ?? ""}
                      onChange={(e) => updateTaskNotes(t.id, e.target.value)}
                      className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      rows={2}
                      placeholder="Notes (optional)…"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="ml-1 rounded-lg border border-rose-800/50 px-2 py-1 text-xs text-rose-300 hover:bg-rose-900/30"
                    title="Remove task"
                    aria-label="Remove task"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* Inline errors */}
        {formError && (
          <div className="no-print rounded-xl border border-rose-700 bg-rose-900/30 px-3 py-2 text-sm text-rose-300" role="alert" aria-live="assertive">
            {formError}
          </div>
        )}

        {/* Signatures only on print */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hidden print:block">
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="border-t border-zinc-700 pt-3 text-sm text-zinc-200">Customer signature / date</div>
            <div className="border-t border-zinc-700 pt-3 text-sm text-zinc-200">Workshop signature / date</div>
          </div>
        </section>
      </div>
    </>
  )
}
