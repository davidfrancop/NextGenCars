// src/pages/Login.tsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { gql, useMutation } from "@apollo/client"
import { useAuth } from "../auth/AuthProvider"
import { motion } from "framer-motion"

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
    }
  }
`

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: "", password: "" })

  const [loginUser, { loading, error }] = useMutation(LOGIN_USER, {
    onError: (err) => {
      console.error("Login error:", err)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await loginUser({ variables: form })
    const token = data?.loginUser?.token

    if (token) {
      // Guarda sesión en tu AuthProvider (y localStorage si allí lo haces)
      login(token)

      // Redirige al dashboard genérico; el router decidirá el dashboard por rol
      navigate("/dashboard", { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] bg-[size:20px_20px] opacity-10 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl p-8"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/nextgencars-logo.png"
            alt="NextGenCars Logo"
            className="w-30 h-20 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-blue-400 mb-4 tracking-wide font-[Orbitron]">
          NextGenCars Control
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="username"            // ✅ Sugerencia Chrome/Edge
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"     // ✅ Sugerencia Chrome/Edge
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all duration-200 shadow-md shadow-blue-700/40 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">
              Invalid credentials
            </p>
          )}
        </form>
      </motion.div>
    </div>
  )
}
