// src/main.tsx
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ApolloProvider } from "@apollo/client"
import client from "./apollo/client"
import { AuthProvider, useAuth } from "./auth/AuthProvider"
import "./index.css"

import Login from "./pages/Login"
import AdminDashboard from "./pages/dashboards/AdminDashboard"
import FrontdeskDashboard from "./pages/dashboards/FrontdeskDashboard"
import MechanicDashboard from "./pages/dashboards/MechanicDashboard"
import Users from "./pages/users/Users"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/frontdesk"
              element={
                <PrivateRoute>
                  <FrontdeskDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard/mechanic"
              element={
                <PrivateRoute>
                  <MechanicDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <Users />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
