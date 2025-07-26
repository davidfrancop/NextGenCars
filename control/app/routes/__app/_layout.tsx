// control/app/routes/__app/_layout.tsx
import { Outlet } from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { decodeJwt } from "~/utils/jwt";
import { authCookie } from "~/utils/setAuthCookie";
import { Sidebar } from "~/components/Sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const token = await authCookie.parse(cookieHeader);

  if (!token) {
    return redirect("/login");
  }

  const user = decodeJwt(token);
  if (!user) return redirect("/login");

  return { user };
}

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
