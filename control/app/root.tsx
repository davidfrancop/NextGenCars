// control/app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { requireUser } from "./utils/auth.server";
import Sidebar from "./components/Sidebar.tsx";

export async function loader({ request }: { request: Request }) {
  const user = await requireUser(request);
  return json({ user });
}

export default function App() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full bg-background text-slate-100">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="flex h-screen overflow-hidden">
          <Sidebar role={user.role} />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
