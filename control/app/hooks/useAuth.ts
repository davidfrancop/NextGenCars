// control/app/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { useNavigate } from "@remix-run/react";
import jwtDecode from "jwt-decode";

interface JwtPayload {
  exp: number;
  role: string;
  [key: string]: unknown;
}

export function useAuth({ redirectTo = "/login" } = {}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(redirectTo);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        navigate(redirectTo);
      } else {
        setIsAuthenticated(true);
        setRole(decoded.role);
      }
    } catch (err) {
      localStorage.removeItem("token");
      navigate(redirectTo);
    }
  }, [navigate, redirectTo]);

  return { isAuthenticated, role };
}
