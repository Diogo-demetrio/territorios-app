import { supabase } from "@/lib/supabase";

import type {
  DadosAtualizarUsuario,
  DadosCriarUsuario,
  RespostaAtualizarUsuario,
  RespostaCriarUsuario,
  RespostaErroApi,
  RespostaListaUsuarios,
} from "@/components/auth/usuarios/types";

const ROTA_USUARIOS =
  "/api/admin/usuarios";

async function obterTokenAcesso() {
  const {
    data,
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error(
      "Erro ao obter sessão:",
      error
    );

    throw new Error(
      "Não foi possível verificar sua sessão."
    );
  }

  const token =
    data.session?.access_token;

  if (!token) {
    throw new Error(
      "Sua sessão expirou. Entre novamente."
    );
  }

  return token;
}

async function tratarResposta<T>(
  resposta: Response
): Promise<T> {
  let dados:
    | T
    | RespostaErroApi
    | null = null;

  try {
    dados = await resposta.json();
  } catch {
    throw new Error(
      "O servidor retornou uma resposta inválida."
    );
  }

  if (!resposta.ok) {
    const erro =
      dados &&
      typeof dados === "object" &&
      "erro" in dados
        ? String(dados.erro)
        : "Não foi possível concluir a operação.";

    throw new Error(erro);
  }

  return dados as T;
}

export async function listarUsuarios() {
  const token =
    await obterTokenAcesso();

  const resposta = await fetch(
    ROTA_USUARIOS,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  return tratarResposta<RespostaListaUsuarios>(
    resposta
  );
}

export async function criarUsuario(
  dados: DadosCriarUsuario
) {
  const token =
    await obterTokenAcesso();

  const resposta = await fetch(
    ROTA_USUARIOS,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${token}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  return tratarResposta<RespostaCriarUsuario>(
    resposta
  );
}

export async function atualizarUsuario(
  dados: DadosAtualizarUsuario
) {
  const token =
    await obterTokenAcesso();

  const resposta = await fetch(
    ROTA_USUARIOS,
    {
      method: "PATCH",
      headers: {
        Authorization:
          `Bearer ${token}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  return tratarResposta<RespostaAtualizarUsuario>(
    resposta
  );
}