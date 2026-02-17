import { jwtDecode } from "jwt-decode";

export function requireAdmin() {
  const token = localStorage.getItem("admin_token");
  if (!token) return false;

  try {
    jwtDecode(token);
    return true;
  } catch {
    return false;
  }
}
