// control/jwt-decode.d.ts
declare module "jwt-decode" {
  export default function jwtDecode<T>(token: string): T;
}
