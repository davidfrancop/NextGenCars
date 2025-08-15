// control/src/pages/Unauthorized.tsx

import { Link, useLocation } from "react-router-dom"

export default function Unauthorized() {
  const location = useLocation() as any
  const needed: string[] | undefined = location?.state?.needed

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-gray-400">
        You do not have permission to access this page.
        {needed?.length ? ` (required: ${needed.join(", ")})` : ""}.
      </p>
      <div className="flex gap-3">
        <Link to="/dashboard" className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700">
          Go to Dashboard
        </Link>
        <Link to="/login" className="px-4 py-2 rounded-2xl bg-gray-800 hover:bg-gray-700">
          Switch User
        </Link>
      </div>
    </div>
  )
}
