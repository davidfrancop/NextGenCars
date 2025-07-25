// control/app/routes/dashboard.tsx
import { PrivateRoute } from "~/components/PrivateRoute";

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div className="p-4 text-xl font-bold">Welcome to the dashboard</div>
    </PrivateRoute>
  );
}
