// control/app/utils/session.server.ts
import { createCookie } from "@remix-run/node";

export const tokenCookie = createCookie("token", {
  maxAge: 60 * 60 * 4, // 4 horas
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
