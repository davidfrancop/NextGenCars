// control/src/pages/vehicles/CreateVehicle.tsx

import { useMutation, useLazyQuery, useQuery } from "@apollo/client"
import { CREATE_VEHICLE } from "@/graphql/mutations/createVehicle"
import { GET_CLIENT_BY_ID } from "@/graphql/queries/getClientById"
import { SEARCH_CLIENTS } from "@/graphql/queries/searchClients"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

type ClientLite = {
  client_id: number
  type: "PERSONAL" | "COMPANY"
  first_name?: string | null
  last_name?: string | null
  company_name?: string | null
  email?: string | null
}

function displayClientName(c?: ClientLite | null) {
  if (!c) return ""
  if (c.type === "COMPANY") return c.company_name || `Company #${c.client_id}`
  const full = `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()
  return full || `Client #${c.client_id}`
}

function Toast({ kind = "success", msg }: { kind?: "success" | "error"; msg: string }) {
  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-xl shadow-lg text-sm z-50 ${
        kind === "success" ? "bg-emerald-700/90" : "bg-red-700/90"
      }`}
      role="status"
    >
      {msg}
    </div>
  )
}

export default function CreateVehicle() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preIdParam = params.get("clientId")
  const preId = preIdParam ? Number(preIdParam) : null

  // Cliente seleccionado (puede venir prefijado)
  const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null)
  const [pickerOpen, setPickerOpen] = useState<boolean>(!preId)

  // Toasts + error local
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // Si viene clientId, obtengo su info
  const { data: preClientData } = useQuery(GET_CLIENT_BY_ID, {
    variables: { client_id: preId ?? 0 },
    skip: !preId,
  })

  useEffect(() => {
    if (preId && preClientData?.client) {
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
  }, [preId, preClientData])

  // Typeahead
  const [term, setTerm] = useState("")
  const [skip, setSkip] = useState(0)
  const TAKE = 20

  const [searchClients, { data: searchData, loading: searching, fetchMore }] = useLazyQuery(SEARCH_CLIENTS, {
    fetchPolicy: "network-only",
  })

  // debounce búsqueda
  const debTimer = useRef<number | null>(null)
  useEffect(() => {
    if (!pickerOpen) return
    if (debTimer.current) window.clearTimeout(debTimer.current)
    debTimer.current = window.setTimeout(() => {
      setSkip(0)
      searchClients({ variables: { type: null, search: term || null, take: TAKE, skip: 0 } })
    }, 250)
    return () => {
      if (debTimer.current) window.clearTimeout(debTimer.current)
    }
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

  // Form vehículo
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    plate: "",        // ← se mapeará a license_plate en el mutation
    vin: "",
    hsn: "",
    tsn: "",
    fuel_type: "Petrol",
    drive: "FWD",
    transmission: "Manual",
    km: "",
  })

  const setField = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }))
  const onChange =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setField(k, e.target.value)
  const onBlurTrim =
    (k: keyof typeof form, upper = false) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.trim()
      setField(k, upper ? val.toUpperCase() : val)
    }

  const [createVehicle, { loading, error: mErr }] = useMutation(CREATE_VEHICLE, {
    refetchQueries: [{ query: GET_VEHICLES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setToast({ kind: "success", msg: "Vehicle created" })
      setTimeout(() => navigate("/vehicles"), 850)
    },
    onError: (e) => {
      setToast({ kind: "error", msg: e.message || "Failed to create vehicle" })
      setTimeout(() => setToast(null), 2000)
    },
  })

  const validate = (): string | null => {
    if (!selectedClient) return "Client is required"
    if (!form.make.trim()) return "Make is required"
    if (!form.model.trim()) return "Model is required"
    const yearN = Number(form.year)
    if (!Number.isInteger(yearN) || yearN < 1950 || yearN > 2100) return "Year must be between 1950 and 2100"
    if (!/^[A-Za-z0-9\- ]{3,15}$/.test(form.plate.trim())) return "Invalid license plate"
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(form.vin.trim().toUpperCase())) return "Invalid VIN (17 chars, no I/O/Q)"
    if (!/^[0-9A-Za-z]{3,4}$/.test(form.hsn.trim())) return "HSN must be 3–4 alphanumerics"
    if (!/^[A-Za-z0-9]{3}$/.test(form.tsn.trim())) return "TSN must be 3 alphanumerics"
    const kmN = Number(form.km)
    if (!Number.isInteger(kmN) || kmN < 0) return "KM must be a non-negative integer"
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setErr(v)
      return
    }
    setErr(null)

    await createVehicle({
      variables: {
        client_id: selectedClient!.client_id,
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        license_plate: form.plate.trim().toUpperCase(), // ← mapeo correcto
        vin: form.vin.trim().toUpperCase(),
        hsn: form.hsn.trim(),
        tsn: form.tsn.trim().toUpperCase(),
        fuel_type: form.fuel_type,
        drive: form.drive,
        transmission: form.transmission,
        km: Number(form.km),
      },
    })
  }

  // ---------- UI (alineado con CreateClient) ----------
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">New vehicle</h1>

      {/* Picker de cliente */}
      <div className="mb-4">
        {!pickerOpen && selectedClient ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
            <div>
              <div className="text-xs text-gray-400">Client</div>
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
            <label className="block text-sm mb-2">Select client</label>
            <input
              placeholder="Type name, company, email, DNI/VAT..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
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
      </div>

      {(err || mErr) && (
        <div className="mb-3 rounded-xl bg-red-800/40 border border-red-700 px-3 py-2 text-sm" role="alert">
          {err || mErr?.message}
        </div>
      )}

      {/* Form vehículo */}
      <form onSubmit={onSubmit} className="grid gap-3" noValidate>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="make">Make *</label>
            <input
              id="make"
              name="make"
              value={form.make}
              onChange={onChange("make")}
              onBlur={onBlurTrim("make")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. BMW"
              type="text"
              inputMode="text"
              maxLength={40}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="model">Model *</label>
            <input
              id="model"
              name="model"
              value={form.model}
              onChange={onChange("model")}
              onBlur={onBlurTrim("model")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. 320d"
              type="text"
              inputMode="text"
              maxLength={40}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="year">Year *</label>
          <input
            id="year"
            name="year"
            value={form.year}
            onChange={onChange("year")}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            placeholder="e.g. 2018"
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="plate">License plate *</label>
            <input
              id="plate"
              name="plate"
              value={form.plate}
              onChange={onChange("plate")}
              onBlur={onBlurTrim("plate", true)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. B-AB 1234"
              type="text"
              inputMode="text"
              maxLength={15}
              pattern="^[A-Za-z0-9\- ]{3,15}$"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="vin">VIN *</label>
            <input
              id="vin"
              name="vin"
              value={form.vin}
              onChange={onChange("vin")}
              onBlur={onBlurTrim("vin", true)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="17 characters"
              type="text"
              inputMode="text"
              maxLength={17}
              pattern="^[A-HJ-NPR-Z0-9]{17}$"
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="hsn">HSN *</label>
            <input
              id="hsn"
              name="hsn"
              value={form.hsn}
              onChange={onChange("hsn")}
              onBlur={onBlurTrim("hsn")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. 0603"
              type="text"
              inputMode="text"
              maxLength={4}
              pattern="^[0-9A-Za-z]{3,4}$"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="tsn">TSN *</label>
            <input
              id="tsn"
              name="tsn"
              value={form.tsn}
              onChange={onChange("tsn")}
              onBlur={onBlurTrim("tsn", true)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. ABC"
              type="text"
              inputMode="text"
              maxLength={3}
              pattern="^[A-Za-z0-9]{3}$"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="km">KM *</label>
            <input
              id="km"
              name="km"
              value={form.km}
              onChange={onChange("km")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. 68000"
              type="number"
              inputMode="numeric"
              min={0}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="fuel_type">Fuel type *</label>
            <select
              id="fuel_type"
              name="fuel_type"
              value={form.fuel_type}
              onChange={onChange("fuel_type")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              required
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="LPG">LPG</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="drive">Drive *</label>
            <select
              id="drive"
              name="drive"
              value={form.drive}
              onChange={onChange("drive")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              required
            >
              <option value="FWD">FWD</option>
              <option value="RWD">RWD</option>
              <option value="AWD">AWD</option>
              <option value="4WD">4WD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="transmission">Transmission *</label>
            <select
              id="transmission"
              name="transmission"
              value={form.transmission}
              onChange={onChange("transmission")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              required
            >
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
          >
            Cancel
          </button>
        </div>
      </form>

      {toast && <Toast kind={toast.kind} msg={toast.msg} />}
    </div>
  )
}
