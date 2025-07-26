// control/app/routes/_index.tsx
import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

export default function RootRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login");
  }, [navigate]);

  return null;
}
