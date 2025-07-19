// control/app/components/Sidebar.tsx
import { Link } from "@remix-run/react";

export default function Sidebar({ role }: { role: string }) {
  const isAdmin = role === "admin";
  const isFrontdesk = role === "frontdesk";
  const isMechanic = role === "mechanic";

  return (
    <aside className="w-64 bg-sidebar p-4 border-r border-border hidden md:block">
      <h1 className="text-2xl font-bold mb-6">NextGen Cars</h1>
      <nav className="space-y-4">
        <Link to="/" className="block hover:text-primary">Dashboard</Link>

        {(isAdmin || isFrontdesk) && (
          <Link to="/clients" className="block hover:text-primary">Clients</Link>
        )}

        {(isAdmin || isFrontdesk || isMechanic) && (
          <Link to="/vehicles" className="block hover:text-primary">Vehicles</Link>
        )}

        {(isAdmin || isFrontdesk) && (
          <Link to="/appointments" className="block hover:text-primary">Appointments</Link>
        )}

        {(isAdmin || isFrontdesk || isMechanic) && (
          <Link to="/work-orders" className="block hover:text-primary">Work Orders</Link>
        )}

        {(isAdmin || isFrontdesk) && (
          <Link to="/invoices" className="block hover:text-primary">Invoices</Link>
        )}

        {isAdmin && (
          <Link to="/users" className="block hover:text-primary">Users</Link>
        )}
      </nav>
    </aside>
  );
}
