import { getCurrentUser } from "./current-user";

export async function getCurrentCongregationId() {
  const usuario = await getCurrentUser();

  if (!usuario) {
    return null;
  }

  return usuario.congregacao_id;
}