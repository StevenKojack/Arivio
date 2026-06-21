export const ADMIN_EMAIL = "stevenkojack2003@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL;
}

export function profileRoleForEmail(email?: string | null) {
  return isAdminEmail(email) ? "admin" : "planner";
}
