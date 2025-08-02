// control/src/components/RecentOrdersTable.tsx
import { useQuery } from "@apollo/client"
import { GET_RECENT_ORDERS } from "@/graphql/queries/getRecentOrders"

export default function RecentOrdersTable() {
  const { data, loading, error } = useQuery(GET_RECENT_ORDERS)

  const orders = data?.recentWorkOrders ?? []

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-600"
      case "in progress":
        return "bg-yellow-600"
      case "pending":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow p-4 text-gray-400">
        <h3 className="text-lg font-semibold mb-4">Recent Work Orders</h3>
        <p className="text-center">Loading recent orders...</p>
      </div>
    )
  }

  if (error) {
    console.error("❌ GraphQL Error:", error)
    return (
      <div className="bg-red-800 text-white p-4 rounded-xl">
        <h3 className="text-lg font-semibold mb-2">Error loading recent orders</h3>
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow p-4 text-gray-400">
        <h3 className="text-lg font-semibold mb-4">Recent Work Orders</h3>
        <p className="text-center">No recent work orders found.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-2xl shadow p-4 overflow-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Work Orders</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="p-2">ID</th>
            <th className="p-2">Client</th>
            <th className="p-2">Vehicle</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="hover:bg-gray-700 transition">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.clientName}</td>
              <td className="p-2">
                <div>
                  <div className="font-medium">{order.vehicleName}</div>
                  <div className="text-xs text-gray-400">{order.vehiclePlate}</div>
                </div>
              </td>
              <td className="p-2">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
