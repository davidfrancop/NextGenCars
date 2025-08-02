// src/components/AppointmentsChart.tsx
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

const data = [
  { day: "Mon", appointments: 3 },
  { day: "Tue", appointments: 5 },
  { day: "Wed", appointments: 2 },
  { day: "Thu", appointments: 6 },
  { day: "Fri", appointments: 4 },
]

export default function AppointmentsChart() {
  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Appointments This Week</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="appointments"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: "#3b82f6" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
