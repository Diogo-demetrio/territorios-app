import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type PapelUsuario = "superadmin" | "admin" | "suporte";

export type UsuarioApp = {
  id: number;
  auth_user_id: string;
  congregacao_id: number | null;
  publicador_id: number | null;
  nome: string;
  nome_usuario: string;
  email: string | null;
  papel: PapelUsuario;
  ativo: boolean;
};

export async function loginUsuario(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha,
  });

  if (error) {
    throw new Error("E-mail ou senha inválidos.");
  }

  if (!data.user) {
    throw new Error("Não foi possível identificar o usuário.");
  }

  return buscarPerfilUsuario(data.user);
}

export async function buscarPerfilUsuario(
  authUser?: User | null
): Promise<UsuarioApp | null> {
  let usuarioAuth = authUser ?? null;

  if (!usuarioAuth) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    usuarioAuth = user;
  }

  const { data, error } = await supabase
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
    .eq("auth_user_id", usuarioAuth.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    throw new Error("Não foi possível carregar o perfil do usuário.");
  }

  if (!data) {
    throw new Error(
      "Esta conta não possui um perfil ativo no aplicativo."
    );
  }

  return data as UsuarioApp;
}

export async function sairUsuario() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("Não foi possível sair do aplicativo.");
  }
}

export function podeAdministrar(usuario: UsuarioApp | null) {
  return (
    usuario?.papel === "superadmin" ||
    usuario?.papel === "admin"
  );
}

export function podeSuporte(usuario: UsuarioApp | null) {
  return (
    usuario?.papel === "superadmin" ||
    usuario?.papel === "admin" ||
    usuario?.papel === "suporte"
  );
}

export function podeExcluir(usuario: UsuarioApp | null) {
  return usuario?.papel === "superadmin";
}

export function podeAcessarCongregacao(
  usuario: UsuarioApp | null,
  congregacaoId: number
) {
  if (!usuario) return false;

  if (usuario.papel === "superadmin") {
    return true;
  }

  return usuario.congregacao_id === congregacaoId;
}