// control/src/pages/vehicles/EditVehicle.tsx

import { useQuery, useMutation, useLazyQuery } from "@apollo/client"
import { GET_VEHICLE_BY_ID } from "@/graphql/queries/getVehicleById"
import { UPDATE_VEHICLE } from "@/graphql/mutations/updateVehicle"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { SEARCH_CLIENTS } from "@/graphql/queries/searchClients"
import { useNavigate, useParams, Link } from "react-router-dom"
import React, { useEffect, useMemo, useRef, useState } from "react"
import Toast, { type ToastState } from "@/components/common/Toast"
import { isoToYyyyMmDd, toDateOnlyOrNull } from "@/utils/Date"

// -------- helpers ----------
const plateRegex = /^[A-Z0-9\- ]{4,12}$/
const normalizePlate = (v: string) => v.toUpperCase().replace(/\s+/g, " ").trim()

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

type FormState = {
  make: string
  model: string
  registration_date: string
  license_plate: string
  vin: string
  hsn?: string
  tsn?: string
  fuel_type?: string
  drive?: string
  transmission?: string
  km?: string
  tuv_date?: string
  last_service_date?: string
}

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

export default function EditVehicle() {
  const params = useParams<{ vehicleId?: string; id?: string }>()
  const idStr = params.vehicleId ?? params.id
  const id = idStr ? Number(idStr) : NaN
  const validId = Number.isFinite(id)
  const navigate = useNavigate()

  const { data, loading: qLoading, error: qError } = useQuery(GET_VEHICLE_BY_ID, {
    variables: { vehicle_id: id },
    skip: !validId,
    fetchPolicy: "cache-and-network",
  })

  const [toast, setToast] = useState<ToastState>(null)

  const [updateVehicle, { loading: mLoading }] = useMutation(UPDATE_VEHICLE, {
    onCompleted: () => {
      setToast({ type: "success", msg: "Vehicle updated" })
      setTimeout(() => navigate("/vehicles"), 600)
    },
    onError: (err) => {
      setToast({ type: "error", msg: err.message || "Failed to update" })
    },
    refetchQueries: [{ query: GET_VEHICLES }],
  })

  // ---------- Client picker ----------
  const [selectedClient, setSelectedClient] = useState<ClientLite | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [term, setTerm] = useState("")
  const [skip, setSkip] = useState(0)
  const TAKE = 20

  const [searchClients, { data: searchData, loading: searching, fetchMore }] = useLazyQuery(SEARCH_CLIENTS, {
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

  // ---------- Vehicle form ----------
  const [form, setForm] = useState<FormState>({
    make: "",
    model: "",
    registration_date: "",
    license_plate: "",
    vin: "",
    hsn: "",
    tsn: "",
    fuel_type: "",
    drive: "",
    transmission: "",
    km: "",
    tuv_date: "",
    last_service_date: "",
  })

  const [errors, setErrors] = useState<{ license_plate?: string; registration_date?: string; vin?: string }>({})

  const plateRef = useRef<HTMLInputElement>(null)
  const regDateRef = useRef<HTMLInputElement>(null)
  const vinRef = useRef<HTMLInputElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Populate form & client
  useEffect(() => {
    const v = data?.vehicle
    if (!v) return
    setForm({
      make: v.make ?? "",
      model: v.model ?? "",
      registration_date: v.year ? `${v.year}-01-01` : "",
      license_plate: v.license_plate ?? "",
      vin: v.vin ?? "",
      hsn: v.hsn ?? "",
      tsn: v.tsn ?? "",
      fuel_type: v.fuel_type ?? "",
      drive: v.drive ?? "",
      transmission: v.transmission ?? "",
      km: v.km?.toString() ?? "",
      tuv_date: isoToYyyyMmDd(v.tuv_date as any),
      last_service_date: isoToYyyyMmDd(v.last_service_date as any),
    })
    if (v.client) {
      setSelectedClient({
        client_id: v.client.client_id,
        type: v.client.type,
        first_name: v.client.first_name,
        last_name: v.client.last_name,
        company_name: v.client.company_name,
        email: (v.client as any).email ?? null,
      })
    }
  }, [data])

  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let val = e.target.value
      if (field === "license_plate") val = normalizePlate(val)
      setForm((f) => ({ ...f, [field]: val }))
    }

  // Validations
  useEffect(() => {
    const e: typeof errors = {}
    if (form.license_plate && !plateRegex.test(form.license_plate)) {
      e.license_plate = "Invalid format. Use letters/numbers, spaces or hyphens (4–12)."
    }
    if (form.registration_date) {
      const d = new Date(form.registration_date)
      const okFormat = /^\d{4}-\d{2}-\d{2}$/.test(form.registration_date)
      const year = d.getUTCFullYear()
      if (!okFormat || isNaN(d.getTime())) {
        e.registration_date = "Invalid date."
      } else if (year < 1950 || year > 2100) {
        e.registration_date = "Year must be between 1950 and 2100."
      }
    }
    if (form.vin && form.vin.length < 11) {
      e.vin = "VIN too short."
    }
    setErrors(e)
  }, [form.license_plate, form.registration_date, form.vin])

  const canSubmit = useMemo(() => Object.keys(errors).length === 0, [errors])

  const focusFirstError = () => {
    if (errors.license_plate) return plateRef.current?.focus()
    if (errors.registration_date) return regDateRef.current?.focus()
    if (errors.vin) return vinRef.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    if (!canSubmit) {
      setTimeout(() => {
        errorSummaryRef.current?.focus()
        focusFirstError()
      }, 0)
      return
    }
    const year = form.registration_date ? new Date(form.registration_date).getUTCFullYear() : undefined

    await updateVehicle({
      variables: {
        vehicle_id: id,
        client_id: selectedClient?.client_id, // 👈 se envía
        make: form.make || undefined,
        model: form.model || undefined,
        year: typeof year === "number" ? year : undefined,
        license_plate: form.license_plate || undefined,
        vin: form.vin || undefined,
        hsn: form.hsn || undefined,
        tsn: form.tsn || undefined,
        fuel_type: form.fuel_type || undefined,
        drive: form.drive || undefined,
        transmission: form.transmission || undefined,
        km: form.km ? Number(form.km) : undefined,
        tuv_date: form.tuv_date ? toDateOnlyOrNull(form.tuv_date) : undefined,
        last_service_date: form.last_service_date ? toDateOnlyOrNull(form.last_service_date) : undefined,
      },
    })
  }

  // Early states
  if (!validId) return <p className="p-6 text-red-400">Invalid vehicle ID.</p>
  if (qLoading) return <p className="p-6 text-gray-300">Loading…</p>
  if (qError) return <p className="p-6 text-red-500">Error: {qError.message}</p>
  if (!data?.vehicle) return <p className="p-6 text-gray-300">Vehicle not found.</p>

  const hasErrors = Object.keys(errors).length > 0
  const ensureOption = (list: readonly string[], value?: string) =>
    value && !list.includes(value) ? [value, ...list] : [...list]
  const fuelOptions = ensureOption(FUEL_OPTIONS, form.fuel_type)
  const driveOptions = ensureOption(DRIVE_OPTIONS, form.drive)
  const transmissionOptions = ensureOption(TRANSMISSION_OPTIONS, form.transmission)

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>

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
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700"
                onClick={() => setPickerOpen(false)}
              >
                Close
              </button>
              {selectedClient && (
                <div className="text-xs text-gray-400 self-center">
                  Current: <span className="font-medium text-gray-200">{displayClientName(selectedClient)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Form … */}
      {/* (todo lo demás del formulario igual que antes: make, model, vin, etc.) */}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!canSubmit || mLoading}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
        >
          {mLoading ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
        >
          Cancel
        </button>
      </div>

      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}
    </div>
  )
}