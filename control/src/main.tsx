// control/src/main.tsx

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "./apollo/client"
import { AuthProvider } from "./auth/AuthProvider"
import "./index.css"

// Páginas
import Login from "./pages/Login"
import Unauthorized from "./pages/Unauthorized"
import AdminDashboard from "./pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "./pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "./pages/dashboards/MechanicDashboard"

// Usuarios
import Users from "./pages/users/Users"
import CreateUser from "./pages/users/CreateUser"
import EditUser from "./pages/users/EditUser"

// Clientes
import Clients from "./pages/clients/Clients"
import CreateClient from "./pages/clients/CreateClient"
import EditClient from "./pages/clients/EditClient"

// Vehículos
import Vehicles from "./pages/vehicles/Vehicles"
import CreateVehicle from "./pages/vehicles/CreateVehicle"
import EditVehicle from "./pages/vehicles/EditVehicle"

// Settings
import Settings from "./pages/Settings"

// Layout y protección
import Layout from "./components/Layout"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Dashboard por rol */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "frontdesk", "mechanic"]}>
                  <Layout />
                </RoleProtectedRoute>
              }
            >
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="frontdesk" element={<FrontdeskDashboard />} />
              <Route path="mechanic" element={<MechanicDashboard />} />
            </Route>

            {/* Gestión de usuarios (solo admin) */}
            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Users />} />
              <Route path="create" element={<CreateUser />} />
              <Route path="edit/:userId" element={<EditUser />} />
            </Route>

            {/* Gestión de clientes (admin y frontdesk) */}
            <Route
              path="/clients"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "frontdesk"]}>
                  <Layout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Clients />} />
              <Route path="create" element={<CreateClient />} />
              <Route path="edit/:clientId" element={<EditClient />} />
            </Route>

            {/* Gestión de vehículos (admin y frontdesk) */}
            <Route
              path="/vehicles"
              element={
                <RoleProtectedRoute allowedRoles={["admin", "frontdesk"]}>
                  <Layout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Vehicles />} />
              <Route path="create" element={<CreateVehicle />} />
              <Route path="edit/:vehicleId" element={<EditVehicle />} />
            </Route>

            {/* Settings (solo admin) */}
            <Route
              path="/settings"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Layout />
                </RoleProtectedRoute>
              }
            >
              <Route index element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
