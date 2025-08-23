// control/src/pages/vehicles/EditVehicle.tsx

import { useQuery, useMutation } from "@apollo/client"
import { GET_VEHICLE_BY_ID } from "@/graphql/queries/getVehicleById"
import { UPDATE_VEHICLE } from "@/graphql/mutations/updateVehicle"
import { GET_VEHICLES } from "@/graphql/queries/getVehicles"
import { useNavigate, useParams, Link } from "react-router-dom"
import React, { useEffect, useMemo, useRef, useState } from "react"
import Toast, { type ToastState } from "@/components/common/Toast"
import { isoToYyyyMmDd, toDateOnlyOrNull } from "@/utils/Date"  // ✅ usar helpers comunes

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
  registration_date: string      // UI full date; backend stores only year
  license_plate: string
  vin: string
  hsn?: string
  tsn?: string
  fuel_type?: string
  drive?: string
  transmission?: string
  km?: string
  tuv_date?: string             // YYYY-MM-DD
  last_service_date?: string    // YYYY-MM-DD
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

  // Refs for a11y focus
  const plateRef = useRef<HTMLInputElement>(null)
  const regDateRef = useRef<HTMLInputElement>(null)
  const vinRef = useRef<HTMLInputElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Populate form values
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
      // ✅ prefill desde ISO/Date a "YYYY-MM-DD"
      tuv_date: isoToYyyyMmDd(v.tuv_date as any),
      last_service_date: isoToYyyyMmDd(v.last_service_date as any),
    })
  }, [data])

  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let val = e.target.value
      if (field === "license_plate") val = normalizePlate(val)
      setForm((f) => ({ ...f, [field]: val }))
    }

  // Client-side validations
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
        // ✅ enviar date-only ("YYYY-MM-DD") solo si existe
        tuv_date: form.tuv_date ? toDateOnlyOrNull(form.tuv_date) : undefined,
        last_service_date: form.last_service_date ? toDateOnlyOrNull(form.last_service_date) : undefined,
      },
    })
  }

  // Early states
  if (!validId) {
    return (
      <div className="p-6 text-white">
        <div className="rounded-xl border border-red-800 bg-red-900/30 p-4">
          <p className="text-red-200">Invalid vehicle ID.</p>
          <Link to="/vehicles" className="underline text-indigo-300 mt-2 inline-block">
            Back to vehicles
          </Link>
        </div>
      </div>
    )
  }
  if (qLoading) return <p className="p-6 text-gray-300">Loading…</p>
  if (qError) return <p className="p-6 text-red-500">Error: {qError.message}</p>
  if (!data?.vehicle) return <p className="p-6 text-gray-300">Vehicle not found.</p>

  const hasErrors = Object.keys(errors).length > 0

  // Ensure current values appear in selects even if not in default lists
  const ensureOption = (list: readonly string[], value?: string) =>
    value && !list.includes(value) ? [value, ...list] : [...list]
  const fuelOptions = ensureOption(FUEL_OPTIONS, form.fuel_type)
  const driveOptions = ensureOption(DRIVE_OPTIONS, form.drive)
  const transmissionOptions = ensureOption(TRANSMISSION_OPTIONS, form.transmission)

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Edit Vehicle</h1>

      {/* Accessible error summary */}
      {submitAttempted && hasErrors && (
        <div
          ref={errorSummaryRef}
          className="mb-4 rounded-xl border border-red-700/60 bg-red-900/30 p-3"
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
        >
          <p className="font-semibold">Please review the following fields:</p>
          <ul className="list-disc ml-5 text-sm mt-1">
            {errors.license_plate && (
              <li>
                <a
                  href="#license_plate"
                  className="underline"
                  onClick={(e) => {
                    e.preventDefault()
                    plateRef.current?.focus()
                  }}
                >
                  License plate: {errors.license_plate}
                </a>
              </li>
            )}
            {errors.registration_date && (
              <li>
                <a
                  href="#registration_date"
                  className="underline"
                  onClick={(e) => {
                    e.preventDefault()
                    regDateRef.current?.focus()
                  }}
                >
                  Registration date: {errors.registration_date}
                </a>
              </li>
            )}
            {errors.vin && (
              <li>
                <a
                  href="#vin"
                  className="underline"
                  onClick={(e) => {
                    e.preventDefault()
                    vinRef.current?.focus()
                  }}
                >
                  VIN: {errors.vin}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl" aria-busy={mLoading ? "true" : "false"} noValidate>
        <div className="grid grid-cols-2 gap-4">
          {/* Make */}
          <div>
            <label className="block text-sm mb-1" htmlFor="make">
              Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              autoComplete="organization"
              value={form.make}
              onChange={onChange("make")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm mb-1" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              autoComplete="off"
              value={form.model}
              onChange={onChange("model")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* Registration date (full date) */}
          <div>
            <label className="block text-sm mb-1" htmlFor="registration_date">
              Registration date
            </label>
            <input
              id="registration_date"
              name="registration_date"
              ref={regDateRef}
              type="date"
              min="1950-01-01"
              max="2100-12-31"
              aria-invalid={!!errors.registration_date}
              aria-describedby={errors.registration_date ? "registration_date-error" : undefined}
              value={form.registration_date}
              onChange={onChange("registration_date")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
            {errors.registration_date && (
              <p id="registration_date-error" className="text-red-400 text-xs mt-1">
                {errors.registration_date}
              </p>
            )}
          </div>

          {/* License plate */}
          <div>
            <label className="block text-sm mb-1" htmlFor="license_plate">
              License plate <span className="sr-only">(required)</span> *
            </label>
            <input
              id="license_plate"
              name="license_plate"
              ref={plateRef}
              type="text"
              aria-required="true"
              required
              aria-invalid={!!errors.license_plate}
              aria-describedby={`${errors.license_plate ? "license_plate-error " : ""}license_plate-help`}
              value={form.license_plate}
              onChange={onChange("license_plate")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
            <p id="license_plate-help" className="text-xs text-zinc-400 mt-1">
              Use letters/numbers, spaces or hyphens (4–12).
            </p>
            {errors.license_plate && (
              <p id="license_plate-error" className="text-red-400 text-xs mt-1">
                {errors.license_plate}
              </p>
            )}
          </div>

          {/* VIN */}
          <div className="col-span-2">
            <label className="block text-sm mb-1" htmlFor="vin">
              VIN
            </label>
            <input
              id="vin"
              name="vin"
              ref={vinRef}
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.vin}
              aria-describedby={errors.vin ? "vin-error" : undefined}
              value={form.vin}
              onChange={onChange("vin")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
            {errors.vin && (
              <p id="vin-error" className="text-red-400 text-xs mt-1">
                {errors.vin}
              </p>
            )}
          </div>

          {/* HSN */}
          <div>
            <label className="block text-sm mb-1" htmlFor="hsn">
              HSN
            </label>
            <input
              id="hsn"
              name="hsn"
              type="text"
              autoComplete="off"
              value={form.hsn}
              onChange={onChange("hsn")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* TSN */}
          <div>
            <label className="block text-sm mb-1" htmlFor="tsn">
              TSN
            </label>
            <input
              id="tsn"
              name="tsn"
              type="text"
              autoComplete="off"
              value={form.tsn}
              onChange={onChange("tsn")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* Fuel type (select) */}
          <div>
            <label className="block text-sm mb-1" htmlFor="fuel_type">
              Fuel type
            </label>
            <select
              id="fuel_type"
              name="fuel_type"
              value={form.fuel_type || ""}
              onChange={onChange("fuel_type")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <option value="">— Select —</option>
              {FUEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {FUEL_OPTIONS.includes(opt as any) ? opt : `${opt} (current)`}
                </option>
              ))}
            </select>
          </div>

          {/* Drive (select) */}
          <div>
            <label className="block text-sm mb-1" htmlFor="drive">
              Drive
            </label>
            <select
              id="drive"
              name="drive"
              value={form.drive || ""}
              onChange={onChange("drive")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <option value="">— Select —</option>
              {DRIVE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {DRIVE_OPTIONS.includes(opt as any) ? opt : `${opt} (current)`}
                </option>
              ))}
            </select>
          </div>

          {/* Transmission (select) */}
          <div>
            <label className="block text-sm mb-1" htmlFor="transmission">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              value={form.transmission || ""}
              onChange={onChange("transmission")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <option value="">— Select —</option>
              {TRANSMISSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {TRANSMISSION_OPTIONS.includes(opt as any) ? opt : `${opt} (current)`}
                </option>
              ))}
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm mb-1" htmlFor="km">
              Mileage (km)
            </label>
            <input
              id="km"
              name="km"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={form.km}
              onChange={onChange("km")}
              autoComplete="off"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* TÜV / Inspection date */}
          <div>
            <label className="block text-sm mb-1" htmlFor="tuv_date">
              TÜV / Inspection date
            </label>
            <input
              id="tuv_date"
              name="tuv_date"
              type="date"
              min="2000-01-01"
              max="2100-12-31"
              value={form.tuv_date || ""}
              onChange={onChange("tuv_date")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>

          {/* Last service date */}
          <div>
            <label className="block text-sm mb-1" htmlFor="last_service_date">
              Last service date
            </label>
            <input
              id="last_service_date"
              name="last_service_date"
              type="date"
              min="2000-01-01"
              max="2100-12-31"
              value={form.last_service_date || ""}
              onChange={onChange("last_service_date")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit || mLoading}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
            aria-disabled={!canSubmit || mLoading}
          >
            {mLoading ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700"
            aria-label="Cancel and go back to the previous page"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Toast */}
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