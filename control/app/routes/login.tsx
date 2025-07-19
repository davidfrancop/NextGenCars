// control/app/routes/login.tsx
import { redirect, json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createToken, getUserFromRequest } from "~/utils/auth.server";
import { tokenCookie } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import { db } from "~/utils/db.server"; // Asegúrate de tener conexión

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserFromRequest(request);
  if (user) return redirect("/");
  return null;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return json({ error: "Invalid email or password" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createToken({
    id: user.user_id.toString(),
    role: user.role,
  });

  return redirect("/", {
    headers: {
      "Set-Cookie": await tokenCookie.serialize(token),
    },
  });
};
