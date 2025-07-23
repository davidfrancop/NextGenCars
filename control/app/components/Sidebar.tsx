// control/app/components/Sidebar.tsx
import { NavLink } from "@remix-run/react";

const navItems = [
  { name: "Dashboard", path: "/" },
  { name: "Clients", path: "/clients" },
  { name: "Vehicles", path: "/vehicles" },
  { name: "Work Orders", path: "/work-orders" },
  { name: "Appointments", path: "/appointments" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white hidden md:flex flex-col shadow-lg z-40">
        <div className="flex items-center h-16 px-6 font-bold text-lg border-b border-gray-800">
          NextGen Cars
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded hover:bg-gray-800 transition ${
                  isActive ? "bg-gray-800 font-semibold" : ""
                }`
              }
              end={item.path === "/"}
              onClick={onClose}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
            onClick={onClose}
          />
          <aside className="relative w-64 bg-gray-900 text-white flex flex-col shadow-xl h-full z-50">
            <div className="flex items-center h-16 px-6 font-bold text-lg border-b border-gray-800">
              NextGen Cars
              <button
                onClick={onClose}
                className="ml-auto text-gray-400 hover:text-white transition p-2"
                aria-label="Close sidebar"
              >
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded hover:bg-gray-800 transition ${
                      isActive ? "bg-gray-800 font-semibold" : ""
                    }`
                  }
                  end={item.path === "/"}
                  onClick={onClose}
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
