// control/app/utils/roles.ts

export function getRedirectByRole(role: string): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "frontdesk":
      return "/clients";
    case "mechanic":
      return "/work-orders";
    default:
      return "/login";
  }
}
