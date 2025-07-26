// control/app/root.tsx
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useEffect } from "react";
import { decodeJwt } from "~/utils/jwt";

import tailwind from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      if (location.pathname !== "/login") navigate("/login");
      return;
    }

    try {
      const decoded = decodeJwt(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        if (location.pathname !== "/login") navigate("/login");
      }
    } catch {
      localStorage.removeItem("token");
      if (location.pathname !== "/login") navigate("/login");
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthWrapper>
      <Outlet />
    </AuthWrapper>
  );
}
