// src/main.tsx

import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "./apollo/client"
import { AuthProvider } from "./auth/AuthProvider"
import "./index.css"

import Login from "./pages/Login"
import AdminDashboard from "./pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "./pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "./pages/dashboards/MechanicDashboard"

import Users from "./pages/users/Users"
import CreateUser from "./pages/users/CreateUser"
import EditUser from "./pages/users/EditUser"

import Layout from "./components/Layout"
import RoleProtectedRoute from "./components/RoleProtectedRoute"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public login */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard por rol con Layout */}
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

            {/* Users panel (admin only) */}
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

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)

