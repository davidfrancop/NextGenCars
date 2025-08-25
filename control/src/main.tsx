// src/main.tsx

import React, { type ReactElement } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "@/apollo/client"
import { AuthProvider } from "@/auth/AuthProvider"
import "@/index.css"

import RoleProtectedRoute from "@/components/RoleProtectedRoute"
import { getCurrentUserRole } from "@/utils/token"

// Public pages
import Login from "@/pages/Login"
import Unauthorized from "@/pages/Unauthorized"

// Dashboards
import AdminDashboard from "@/pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "@/pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "@/pages/dashboards/MechanicDashboard"

// Users
import Users from "@/pages/users/Users"
import CreateUser from "@/pages/users/CreateUser"
import EditUser from "@/pages/users/EditUser"

// Clients
import Clients from "@/pages/clients/Clients"
import CreateClient from "@/pages/clients/CreateClient"
import EditClient from "@/pages/clients/EditClient"

// Vehicles
import Vehicles from "@/pages/vehicles/Vehicles"
import CreateVehicle from "@/pages/vehicles/CreateVehicle"
import EditVehicle from "@/pages/vehicles/EditVehicle"

// Work Orders
import WorkOrders from "@/pages/workorders/WorkOrders"
import CreateWorkOrder from "@/pages/workorders/CreateWorkOrder"
import EditWorkOrder from "@/pages/workorders/EditWorkOrder"
import WorkOrderDetail from "@/pages/workorders/DetailsWorkOrder"

// Settings
import Settings from "@/pages/Settings"

function RoleBasedDashboard(): ReactElement {
  const role = getCurrentUserRole() ?? ""
  const byRole: Record<string, ReactElement> = {
    admin: <AdminDashboard />,
    frontdesk: <FrontdeskDashboard />,
    mechanic: <MechanicDashboard />,
  }
  return byRole[role] ?? <Navigate to="/unauthorized" replace />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Private (single wrapper) */}
            <Route element={<RoleProtectedRoute />}>
              {/* Dashboard */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />

              {/* Users */}
              <Route path="/users" element={<Users />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/:userId/edit" element={<EditUser />} />

              {/* Clients */}
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/:id/edit" element={<EditClient />} />

              {/* Vehicles */}
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/create" element={<CreateVehicle />} />
              <Route path="/vehicles/:id/edit" element={<EditVehicle />} />

              {/* Work Orders */}
              <Route path="/workorders" element={<WorkOrders />} />
              <Route path="/workorders/create" element={<CreateWorkOrder />} />
              <Route path="/workorders/:id/edit" element={<EditWorkOrder />} />
              <Route path="/workorders/:id" element={<WorkOrderDetail />} />

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
