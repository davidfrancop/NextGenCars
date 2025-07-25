// control/app/components/PrivateRoute.tsx
import { useAuth } from "~/hooks/useAuth";

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null; // opcional: spinner de carga
  }

  return <>{children}</>;
}
