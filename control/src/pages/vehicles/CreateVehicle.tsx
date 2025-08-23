// control/src/pages/vehicles/CreateVehicle.tsx

import { useMutation, useLazyQuery, useQuery } from "@apollo/client"
import { CREATE_VEHICLE } from "@/graphql/mutations/createVehicle"
import { GET_CLIENT_BY_ID } from "@/graphql/queries/getClientById"
import { SEARCH_CLIENTS } from "@/graphql/queries/searchClients"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Toast, { type ToastState } from "@/components/common/Toast" // ✅ usa el toast común
import { parseDateEU } from "@/utils/date"                         // ✅ nuevo helper EU

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

// --- Helpers / constants ---
const normalizePlate = (v: string) => v.toUpperCase().replace(/\s+/g, " ").trim()
const EU_DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/ // dd/MM/yyyy

const FUEL_OPTIONS = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Plug-in Hybrid",
  "Electric",
  "CNG",
  "LPG",
  "Hydrogen",
  "Other",
] as const
const DRIVE_OPTIONS = ["FWD", "RWD", "AWD", "4WD"] as const
const TRANSMISSION_OPTIONS = ["Manual", "Automatic", "CVT", "DCT", "Semi-automatic"] as const

export default function CreateVehicle() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preIdParam = params.get("clientId")
  const preId = preIdParam ? Number(preIdParam) : null

  // Selected client (can be prefilled)
  const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null)
  const [pickerOpen, setPickerOpen] = useState<boolean>(!preId)

  // ✅ Toast común
  const [toast, setToast] = useState<ToastState>(null)
  const [err, setErr] = useState<string | null>(null)

  // Prefill client
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

  // Typeahead search
  const [term, setTerm] = useState("")
  const [skip, setSkip] = useState(0)
  const TAKE = 20

  const [searchClients, { data: searchData, loading: searching, fetchMore }] = useLazyQuery(SEARCH_CLIENTS, {
    fetchPolicy: "network-only",
  })

  // debounce search
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

  // Vehicle form (guardamos fechas en dd/MM/yyyy)
  const [form, setForm] = useState({
    make: "",
    model: "",
    registration_date: "", // dd/MM/yyyy (derive year for backend)
    plate: "",             // maps to license_plate
    vin: "",
    hsn: "",
    tsn: "",
    fuel_type: "",
    drive: "",
    transmission: "",
    km: "",
    // NEW fields EU
    tuv_date: "",            // dd/MM/yyyy -> DateTime
    last_service_date: "",   // dd/MM/yyyy -> DateTime
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
  const onBlurPlate = (e: React.FocusEvent<HTMLInputElement>) => setField("plate", normalizePlate(e.target.value))

  const [createVehicle, { loading, error: mErr }] = useMutation(CREATE_VEHICLE, {
    refetchQueries: [{ query: GET_VEHICLES }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setToast({ type: "success", msg: "Vehicle created" })
      setTimeout(() => navigate("/vehicles"), 850)
    },
    onError: (e) => {
      setToast({ type: "error", msg: e.message || "Failed to create vehicle" })
    },
  })

  // ---------- Validaciones ----------
  const validateEUDate = (value: string, label: string, opts?: { required?: boolean }) => {
    if (!value) return opts?.required ? `${label} is required` : null
    if (!EU_DATE_RE.test(value)) return `${label} must be dd/MM/yyyy`
    const iso = parseDateEU(value)
    if (!iso) return `Invalid ${label.toLowerCase()}`
    const d = new Date(iso)
    const year = d.getUTCFullYear()
    if (year < 1950 || year > 2100) return `${label} must be between 1950 and 2100`
    return null
  }

  const validate = (): string | null => {
    if (!selectedClient) return "Client is required"
    if (!form.make.trim()) return "Make is required"
    if (!form.model.trim()) return "Model is required"

    // Registration date (required) -> derive year
    const regErr = validateEUDate(form.registration_date, "Registration date", { required: true })
    if (regErr) return regErr

    // Optional dates (TÜV & last service)
    const tuvErr = form.tuv_date ? validateEUDate(form.tuv_date, "TÜV/Inspection date") : null
    if (tuvErr) return tuvErr
    const lastServErr = form.last_service_date ? validateEUDate(form.last_service_date, "Last service date") : null
    if (lastServErr) return lastServErr

    if (!/^[A-Za-z0-9\- ]{4,12}$/.test(form.plate.trim())) return "Invalid license plate (4–12, letters/numbers, spaces or hyphens)"
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(form.vin.trim().toUpperCase())) return "Invalid VIN (17 chars, no I/O/Q)"
    if (!/^[0-9A-Za-z]{4}$/.test(form.hsn.trim())) return "HSN must be exactly 4 alphanumerics"
    if (!/^[A-Za-z0-9]{3}$/.test(form.tsn.trim())) return "TSN must be exactly 3 alphanumerics"
    if (!form.fuel_type) return "Fuel type is required"
    if (!form.drive) return "Drive is required"
    if (!form.transmission) return "Transmission is required"

    const kmN = Number(form.km)
    if (!Number.isInteger(kmN) || kmN < 0) return "Mileage must be a non-negative integer"
    return null
  }

  // ---------- Submit ----------
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setErr(v)
      return
    }
    setErr(null)

    // Derive year from EU registration date
    const regISO = parseDateEU(form.registration_date)!
    const year = new Date(regISO).getUTCFullYear()

    await createVehicle({
      variables: {
        client_id: selectedClient!.client_id,
        make: form.make.trim(),
        model: form.model.trim(),
        year, // derived from registration_date
        license_plate: normalizePlate(form.plate),
        vin: form.vin.trim().toUpperCase(),
        hsn: form.hsn.trim().toUpperCase(),
        tsn: form.tsn.trim().toUpperCase(),
        fuel_type: form.fuel_type,
        drive: form.drive,
        transmission: form.transmission,
        km: Number(form.km),
        // NEW optional dates — send ISO if provided
        ...(form.tuv_date ? { tuv_date: parseDateEU(form.tuv_date) } : {}),
        ...(form.last_service_date ? { last_service_date: parseDateEU(form.last_service_date) } : {}),
      },
    })
  }

  // ---------- UI ----------
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">New vehicle</h1>

      {/* Client picker */}
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
        <div className="mb-3 rounded-xl bg-red-800/40 border border-red-700 px-3 py-2 text-sm" role="alert" aria-live="assertive">
          {err || mErr?.message}
        </div>
      )}

      {/* Vehicle form */}
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

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="registration_date">Registration date *</label>
            <input
              id="registration_date"
              name="registration_date"
              value={form.registration_date}
              onChange={onChange("registration_date")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              type="text"
              placeholder="dd/MM/yyyy"
              inputMode="numeric"
              required
            />
            <p className="text-xs text-zinc-400 mt-1">
              European format <span className="font-mono">dd/MM/yyyy</span>. Year is derived automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="km">Mileage (km) *</label>
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

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="plate">License plate *</label>
            <input
              id="plate"
              name="plate"
              value={form.plate}
              onChange={onChange("plate")}
              onBlur={onBlurPlate}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. B-AB 1234"
              type="text"
              inputMode="text"
              maxLength={12}
              pattern="^[A-Za-z0-9\\- ]{4,12}$"
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
              onBlur={onBlurTrim("hsn", true)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              placeholder="e.g. 0603"
              type="text"
              inputMode="text"
              maxLength={4}
              pattern="^[0-9A-Za-z]{4}$"
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
            <label className="block text-sm mb-1" htmlFor="tuv_date">TÜV / Inspection date</label>
            <input
              id="tuv_date"
              name="tuv_date"
              value={form.tuv_date}
              onChange={onChange("tuv_date")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
              type="text"
              placeholder="dd/MM/yyyy"
              inputMode="numeric"
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
              <option value="">— Select —</option>
              {FUEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
              <option value="">— Select —</option>
              {DRIVE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
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
              <option value="">— Select —</option>
              {TRANSMISSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="last_service_date">Last service date</label>
          <input
            id="last_service_date"
            name="last_service_date"
            value={form.last_service_date}
            onChange={onChange("last_service_date")}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            type="text"
            placeholder="dd/MM/yyyy"
            inputMode="numeric"
          />
          <p className="text-xs text-zinc-400 mt-1">
            Optional. Helps the workshop plan next maintenance.
          </p>
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

      {/* ✅ Toast común */}
      {toast && (
        <Toast
          type={toast.type}
          msg={toast.msg}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}