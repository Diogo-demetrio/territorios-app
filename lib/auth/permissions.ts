import { getCurrentUser } from "./current-user";

export async function isSuperAdmin() {
  const user = await getCurrentUser();

  return user?.papel === "superadmin";
}

export async function isAdmin() {
  const user = await getCurrentUser();

  return (
    user?.papel === "admin" ||
    user?.papel === "superadmin"
  );
}

export async function isSupport() {
  const user = await getCurrentUser();

  return (
    user?.papel === "suporte" ||
    user?.papel === "admin" ||
    user?.papel === "superadmin"
  );
}