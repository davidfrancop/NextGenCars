// control/app/routes/logout.tsx
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { tokenCookie } from "~/utils/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/login", {
    headers: {
      "Set-Cookie": await tokenCookie.serialize("", { maxAge: 0 }),
    },
  });
};
