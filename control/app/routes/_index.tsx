// control/app/routes/_index.tsx
export default function Dashboard() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="text-sm text-slate-400">Total Clients</h3>
          <p className="text-2xl font-bold text-sky-400">128</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="text-sm text-slate-400">Vehicles</h3>
          <p className="text-2xl font-bold text-sky-400">304</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="text-sm text-slate-400">Active Orders</h3>
          <p className="text-2xl font-bold text-sky-400">12</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl shadow">
          <h3 className="text-sm text-slate-400">Appointments Today</h3>
          <p className="text-2xl font-bold text-sky-400">5</p>
        </div>
      </div>
    </section>
  );
}
