// control/app/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { decodeJwt } from "~/utils/jwt";

export function useAuth({ redirectTo = "/login" } = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate(redirectTo);
      return;
    }

    try {
      const decoded = decodeJwt(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        navigate(redirectTo);
      } else {
        setIsAuthenticated(true);
        setRole(decoded.role);
      }
    } catch {
      localStorage.removeItem("token");
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);

  return { isAuthenticated, role };
}
