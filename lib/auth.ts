import { supabase } from "@/lib/supabase";

export type PapelUsuario = "admin" | "suporte";

export type UsuarioApp = {
  id: number;
  congregacao_id: number | null;
  nome: string;
  nome_usuario: string;
  papel: PapelUsuario;
};

export async function loginUsuario(nomeUsuario: string, senha: string) {
  const { data, error } = await supabase.rpc("login_usuario_app", {
    p_nome_usuario: nomeUsuario,
    p_senha: senha,
  });

  if (error) {
    throw new Error("Erro ao fazer login.");
  }

  if (!data || data.length === 0) {
    throw new Error("Usuário ou senha inválidos.");
  }

  return data[0] as UsuarioApp;
}

export function salvarSessao(usuario: UsuarioApp) {
  localStorage.setItem("territorios_usuario", JSON.stringify(usuario));
}

export function obterSessao(): UsuarioApp | null {
  const raw = localStorage.getItem("territorios_usuario");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem("territorios_usuario");
}

export function podeAdministrar(usuario: UsuarioApp | null) {
  return usuario?.papel === "admin";
}

export function podeSuporte(usuario: UsuarioApp | null) {
  return usuario?.papel === "admin" || usuario?.papel === "suporte";
}