import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from("usuarios_app")
    .select(`
      id,
      auth_user_id,
      congregacao_id,
      publicador_id,
      nome,
      nome_usuario,
      email,
      papel,
      ativo
    `)
    .eq("auth_user_id", user.id)
    .eq("ativo", true)
    .single();

  if (perfilError) {
    return null;
  }

  return perfil;
}