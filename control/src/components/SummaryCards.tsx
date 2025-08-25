// control/src/components/SummaryCards.tsx

import { Car, ClipboardList, Users, DollarSign, Info } from "lucide-react"

type Stat = {
  label: string
  value: number | string | null | undefined
}

const ICONS: Record<string, React.ComponentType<any>> = {
  Vehicles: Car,
  "Work Orders": ClipboardList,
  Clients: Users,
  "Revenue (€)": DollarSign,
}

const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
const cf = new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" })

function formatValue(label: string, value: Stat["value"]) {
  if (value == null) return "—"
  if (typeof value === "string") return value

  // Si es el revenue, formatear como moneda €
  if (label.toLowerCase().includes("revenue")) {
    return cf.format(value)
  }

  // Para contadores (Vehicles, Work Orders, Clients)
  return nf.format(value)
}

export default function SummaryCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(({ label, value }) => {
        const Icon = ICONS[label] ?? Info
        return (
          <div
            key={label}
            className="bg-gray-800 rounded-2xl shadow p-4 flex items-center justify-between"
            aria-label={`Stat card ${label}`}
          >
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-2xl font-semibold">{formatValue(label, value)}</p>
            </div>
            <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
        )
      })}
    </div>
  )
}
