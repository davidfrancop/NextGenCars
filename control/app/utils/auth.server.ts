// control/app/utils/auth.server.ts
import jwt from "jsonwebtoken";
import { tokenCookie } from "./session.server";
import { redirect } from "@remix-run/node";

const SECRET = process.env.JWT_SECRET || "nextgencars_secret";

// ✅ Crea el token
export async function createToken(user: { id: string; role: string }) {
  return jwt.sign(user, SECRET, { expiresIn: "4h" });
}

// ✅ Extrae el usuario desde cookie
export async function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie");
  const token = await tokenCookie.parse(cookieHeader);

  if (!token) return null;

  try {
    const user = jwt.verify(token, SECRET) as { id: string; role: string };
    return user;
  } catch {
    return null;
  }
}

// ✅ Requiere usuario autenticado
export async function requireUser(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) throw redirect("/login");
  return user;
}

// ✅ Requiere rol autorizado
export async function requireRole(request: Request, roles: string[]) {
  const user = await requireUser(request);
  if (!roles.includes(user.role)) {
    throw new Response("Unauthorized", { status: 403 });
  }
  return user;
}
