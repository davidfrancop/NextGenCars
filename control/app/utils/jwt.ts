// control/app/utils/jwt.ts

type DecodedToken = {
  id: number;
  email: string;
  role: "admin" | "frontdesk" | "mechanic";
  iat: number;
  exp: number;
};

export function decodeJwt(token: string): DecodedToken {
  const payload = token.split(".")[1];
  const json = atob(payload); // usa Buffer en Node si estás del lado server
  return JSON.parse(json);
}
