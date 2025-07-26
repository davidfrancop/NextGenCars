// control/app/utils/setAuthCookie.ts
import { createCookie } from "@remix-run/node";

export const authCookie = createCookie("token", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: true, // ❗ pon false si estás en localhost sin https
  maxAge: 60 * 60 * 24, // 1 día
});

