// src/pages/clients/Clients.tsx
import { useQuery, useMutation } from "@apollo/client"
import { GET_PERSONAL_CLIENTS } from "@/graphql/queries/getPersonalClients"
import { DELETE_CLIENT } from "@/graphql/mutations/deleteClient"
import { Link } from "react-router-dom"
import { UserPlus, Pencil, Trash2 } from "lucide-react"

export default function Clients() {
  const { data, loading, error } = useQuery(GET_PERSONAL_CLIENTS)
  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [{ query: GET_PERSONAL_CLIENTS }],
  })

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient({ variables: { clientId: id } })
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          to="/clients/create"
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow transition"
        >
          <UserPlus size={18} className="mr-2" />
          New Client
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-xl shadow">
          <thead>
            <tr className="text-left bg-gray-700 text-gray-300">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Country</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.personalClients?.map((client: any) => (
              <tr
                key={client.client_id}
                className="border-b border-gray-700 hover:bg-gray-700 transition"
              >
                <td className="px-6 py-4">{client.client_id}</td>
                <td className="px-6 py-4">{client.first_name} {client.last_name}</td>
                <td className="px-6 py-4">{client.email}</td>
                <td className="px-6 py-4">{client.phone}</td>
                <td className="px-6 py-4">{client.country}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    to={`/clients/edit/${client.client_id}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-600"
                    aria-label={`Edit client ${client.first_name} ${client.last_name}`}
                  >
                    <Pencil size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(client.client_id)}
                    className="inline-flex items-center text-red-400 hover:text-red-600"
                    aria-label={`Delete client ${client.first_name} ${client.last_name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {data?.personalClients?.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
