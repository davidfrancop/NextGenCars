// control/app/routes/logout.tsx
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authCookie } from "~/utils/setAuthCookie";

export async function loader({ request }: LoaderFunctionArgs) {
  // Limpia la cookie 'token'
  return redirect("/login", {
    headers: {
      "Set-Cookie": await authCookie.serialize("", {
        maxAge: 0, // eliminar
      }),
    },
  });
}
