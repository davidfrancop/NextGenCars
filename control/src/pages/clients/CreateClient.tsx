// src/pages/clients/CreateClient.tsx

import { useNavigate, useSearchParams } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { useEffect, useState } from "react"
import { CREATE_CLIENT } from "@/graphql/mutations/createClient"
import { GET_CLIENTS } from "@/graphql/queries/getClients"

type TType = "PERSONAL" | "COMPANY"

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

export default function CreateClient() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const initialType = ((params.get("type") || "PERSONAL").toUpperCase() === "COMPANY"
    ? "COMPANY"
    : "PERSONAL") as TType

  const [type, setType] = useState<TType>(initialType)
  const isCompany = type === "COMPANY"

  const [form, setForm] = useState({
    // PERSONAL
    first_name: "",
    last_name: "",
    // COMPANY
    company_name: "",
    vat_number: "",
    contact_person: "",
    // Compartidos
    email: "",
    phone: "",
    dni: "",
    address: "",
    country: "",
    city: "",
    postal_code: "",
  })

  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: "success" | "error"; msg: string } | null>(null)

  useEffect(() => {
    setType(initialType)
  }, [initialType])

  const [createClient, { loading, error: mErr }] = useMutation(CREATE_CLIENT, {
    refetchQueries: [{ query: GET_CLIENTS }],
    awaitRefetchQueries: true,
    onCompleted: (res) => {
      const id = res?.createClient?.client_id
      setToast({ kind: "success", msg: "Client created" })
      setTimeout(() => {
        if (id) navigate(`/vehicles/create?clientId=${id}`)
        else navigate(`/vehicles/create`)
      }, 700)
    },
    onError: (e) => {
      setToast({ kind: "error", msg: e.message || "Failed to create client" })
      setTimeout(() => setToast(null), 2000)
    },
  })

  const setField = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }))
  const onChange =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setField(k, e.target.value)
    }
  const onBlurTrim =
    (k: keyof typeof form, toUpper = false) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.trim()
      setField(k, toUpper ? val.toUpperCase() : val)
    }

  const validate = (): string | null => {
    if (!isCompany) {
      if (!form.first_name.trim()) return "First name is required for PERSONAL"
      if (!form.last_name.trim()) return "Last name is required for PERSONAL"
    } else {
      if (!form.company_name.trim()) return "Company name is required for COMPANY"
      if (!form.vat_number.trim()) return "VAT number is required for COMPANY"
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Please enter a valid email"
    if (form.phone && !/^[0-9+()\-.\s]{5,}$/.test(form.phone.trim())) return "Please enter a valid phone"
    if (form.postal_code && !/^[A-Za-z0-9\-\s]{3,10}$/.test(form.postal_code.trim())) return "Please enter a valid postal code"
    if (form.dni && !/^[A-Za-z0-9\-]{3,32}$/.test(form.dni.trim())) return "Please enter a valid DNI"
    if (form.vat_number && !/^[A-Za-z0-9\-]{3,32}$/.test(form.vat_number.trim())) return "Please enter a valid VAT"
    return null
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = validate()
    if (v) {
      setErr(v)
      return
    }
    setErr(null)

    const data: any = {
      type,
      ...(!isCompany
        ? { first_name: form.first_name.trim(), last_name: form.last_name.trim() }
        : {
            company_name: form.company_name.trim(),
            vat_number: form.vat_number.trim().toUpperCase(),
            contact_person: form.contact_person.trim() || null,
          }),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      dni: form.dni.trim().toUpperCase() || null,
      address: form.address.trim() || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
    }

    createClient({ variables: { data } })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">New client</h1>

      {/* Tabs tipo */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setType("PERSONAL")}
          className={`px-3 py-1 rounded-xl ${!isCompany ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
          aria-pressed={!isCompany ? "true" : "false"}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => setType("COMPANY")}
          className={`px-3 py-1 rounded-xl ${isCompany ? "bg-zinc-700" : "bg-zinc-800 hover:bg-zinc-700"}`}
          aria-pressed={isCompany ? "true" : "false"}
        >
          Company
        </button>
      </div>

      {(err || mErr) && (
        <div className="mb-3 rounded-xl bg-red-800/40 border border-red-700 px-3 py-2 text-sm" role="alert">
          {err || mErr?.message}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid gap-3" noValidate>
        {/* Campos por tipo */}
        {!isCompany ? (
          <>
            <div>
              <label className="block text-sm mb-1" htmlFor="first_name">First name *</label>
              <input
                id="first_name"
                name="first_name"
                value={form.first_name}
                onChange={onChange("first_name")}
                onBlur={onBlurTrim("first_name")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900"
                placeholder="Enter first name"
                autoComplete="given-name"
                type="text"
                inputMode="text"
                maxLength={60}
                pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="last_name">Last name *</label>
              <input
                id="last_name"
                name="last_name"
                value={form.last_name}
                onChange={onChange("last_name")}
                onBlur={onBlurTrim("last_name")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900"
                placeholder="Enter last name"
                autoComplete="family-name"
                type="text"
                inputMode="text"
                maxLength={60}
                pattern="^[A-Za-zÀ-ÿ' -]{2,}$"
                required
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm mb-1" htmlFor="company_name">Company name *</label>
              <input
                id="company_name"
                name="company_name"
                value={form.company_name}
                onChange={onChange("company_name")}
                onBlur={onBlurTrim("company_name")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900"
                placeholder="Enter company name"
                autoComplete="organization"
                type="text"
                inputMode="text"
                maxLength={120}
                required={isCompany}
                aria-required={isCompany ? "true" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="vat_number">VAT *</label>
              <input
                id="vat_number"
                name="vat_number"
                value={form.vat_number}
                onChange={onChange("vat_number")}
                onBlur={onBlurTrim("vat_number", true)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900"
                placeholder="e.g. DE123456789"
                autoComplete="off"
                type="text"
                inputMode="text"
                maxLength={32}
                pattern="^[A-Za-z0-9\\-]{3,32}$"
                required={isCompany}
                aria-required={isCompany ? "true" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="contact_person">Contact person</label>
              <input
                id="contact_person"
                name="contact_person"
                value={form.contact_person}
                onChange={onChange("contact_person")}
                onBlur={onBlurTrim("contact_person")}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900"
                placeholder="Enter contact person"
                autoComplete="name"
                type="text"
                inputMode="text"
                maxLength={80}
              />
            </div>
          </>
        )}

        {/* Compartidos */}
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              value={form.email}
              onChange={onChange("email")}
              onBlur={onBlurTrim("email")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="name@example.com"
              autoComplete="email"
              type="email"
              inputMode="email"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onChange("phone")}
              onBlur={onBlurTrim("phone")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="+49 123 456 789"
              autoComplete="tel"
              type="tel"
              inputMode="tel"
              maxLength={20}
              pattern="^[0-9+()\\-\\.\\s]{5,}$"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="dni">DNI</label>
            <input
              id="dni"
              name="dni"
              value={form.dni}
              onChange={onChange("dni")}
              onBlur={onBlurTrim("dni", true)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="ID / DNI"
              autoComplete="off"
              type="text"
              inputMode="text"
              maxLength={32}
              pattern="^[A-Za-z0-9\\-]{3,32}$"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="country">Country</label>
            <input
              id="country"
              name="country"
              value={form.country}
              onChange={onChange("country")}
              onBlur={onBlurTrim("country")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="Germany"
              autoComplete="country-name"
              type="text"
              inputMode="text"
              maxLength={56}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              value={form.city}
              onChange={onChange("city")}
              onBlur={onBlurTrim("city")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="Munich"
              autoComplete="address-level2"
              type="text"
              inputMode="text"
              maxLength={85}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="postal_code">Postal code</label>
            <input
              id="postal_code"
              name="postal_code"
              value={form.postal_code}
              onChange={onChange("postal_code")}
              onBlur={onBlurTrim("postal_code")}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900"
              placeholder="80331"
              autoComplete="postal-code"
              type="text"
              inputMode="numeric"
              maxLength={10}
              pattern="^[A-Za-z0-9\\-\\s]{3,10}$"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={onChange("address")}
            onBlur={onBlurTrim("address")}
            className="w-full px-3 py-2 rounded-xl bg-zinc-900"
            placeholder="Street, number, etc."
            autoComplete="street-address"
            type="text"
            inputMode="text"
            maxLength={120}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Next"}
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
