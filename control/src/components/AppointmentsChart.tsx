// src/components/AppointmentsChart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import { useQuery } from "@apollo/client"
import { GET_APPOINTMENTS_CHART } from "@/graphql/queries/getAppointmentsChart"

export default function AppointmentsChart() {
  const { data, loading, error } = useQuery(GET_APPOINTMENTS_CHART)

  const chartData = (data?.appointmentsThisWeek ?? []).map((d: { day: string; count: number }) => ({
    day: d.day,
    appointments: d.count,
  }))

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Appointments This Week</h3>
      {loading && <p className="text-gray-400">Loading chart...</p>}
      {error && <p className="text-red-500">Failed to load chart</p>}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="appointments" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
