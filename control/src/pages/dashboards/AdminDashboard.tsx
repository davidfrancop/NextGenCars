// control/src/pages/dashboards/AdminDashboard.tsx

import Layout from "@/components/Layout"
import { useQuery } from "@apollo/client"
import { GET_DASHBOARD_STATS } from "@/graphql/queries/getDashboardStats"
import SummaryCards from "@/components/SummaryCards"
import RecentOrdersTable from "@/components/RecentOrdersTable"
import AppointmentsChart from "@/components/AppointmentsChart"

export default function AdminDashboard() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS)

  const stats = [
    { label: "Vehicles", value: data?.dashboardStats.vehicles ?? 0 },
    { label: "Work Orders", value: data?.dashboardStats.workOrders ?? 0 },
    { label: "Clients", value: data?.dashboardStats.clients ?? 0 },
    { label: "Revenue (€)", value: data?.dashboardStats.revenue ?? 0 },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {loading && (
          <p className="text-gray-300 text-center mt-10">Loading dashboard...</p>
        )}

        {error && (
          <p className="text-red-500 text-center mt-10">Error loading dashboard data.</p>
        )}

        {!loading && !error && (
          <>
            <SummaryCards stats={stats} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <RecentOrdersTable />
              <AppointmentsChart />
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
