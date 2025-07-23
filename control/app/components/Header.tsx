// control/app/components/Header.tsx

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:ml-64 bg-white border-b shadow-sm">
      <div className="flex items-center gap-4">
        {/* Menu button only visible on mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <svg
            className="h-6 w-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-xl font-bold tracking-tight text-gray-900">Control Panel</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Dummy user avatar */}
        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-700 font-bold">A</span>
      </div>
    </header>
  );
}
