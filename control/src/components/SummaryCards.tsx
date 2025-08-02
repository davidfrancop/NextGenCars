// control/src/components/SummaryCards.tsx
import { Car, ClipboardList, Users, DollarSign } from "lucide-react"

type Stat = {
  label: string
  value: number | string
}

export default function SummaryCards({ stats }: { stats: Stat[] }) {
  const icons = {
    Vehicles: Car,
    "Work Orders": ClipboardList,
    Clients: Users,
    "Revenue (€)": DollarSign,
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map(({ label, value }) => {
        const Icon = icons[label as keyof typeof icons]
        return (
          <div
            key={label}
            className="bg-gray-800 rounded-2xl shadow p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-400">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
            <Icon className="w-8 h-8 text-primary" />
          </div>
        )
      })}
    </div>
  )
}
