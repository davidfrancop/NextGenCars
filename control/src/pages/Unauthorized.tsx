
// control/src/pages/Unauthorized.tsx

import { Link, useLocation, type Location } from "react-router-dom"

type UnauthorizedState = {
  needed?: string[]
  from?: Location
}

export default function Unauthorized() {
  const location = useLocation()
  const state = (location.state as UnauthorizedState) || {}
  const needed = state.needed ?? []
  const fromPath = state.from?.pathname ?? "/dashboard"

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
      <h1 className="text-3xl font-bold">Access Denied</h1>

      <p className="text-gray-400">
        You do not have permission to access this page.
        {needed.length > 0 ? (
          <> (required roles: <strong>{needed.join(", ")}</strong>).</>
        ) : (
          "."
        )}
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to={fromPath}
          className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700"
        >
          Volver
        </Link>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700"
        >
          Switch User
        </Link>
      </div>
    </div>
  )
}
