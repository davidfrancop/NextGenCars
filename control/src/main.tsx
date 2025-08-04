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
import RoleProtectedRoute from "./components/RoleProtectedRoute"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Dashboard routes */}
            <Route
              path="/dashboard/admin"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/frontdesk"
              element={
                <RoleProtectedRoute allowedRoles={["frontdesk"]}>
                  <FrontdeskDashboard />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mechanic"
              element={
                <RoleProtectedRoute allowedRoles={["mechanic"]}>
                  <MechanicDashboard />
                </RoleProtectedRoute>
              }
            />

            {/* Admin-only route */}
            <Route
              path="/users"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </RoleProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
