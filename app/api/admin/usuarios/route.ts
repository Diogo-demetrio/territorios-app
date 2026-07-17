import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type PapelUsuario =
  | "superadmin"
  | "admin"
  | "suporte";

type CorpoCriacaoUsuario = {
  usuarioAppId?: number | null;
  nome?: string;
  email?: string;
  telefone?: string | null;
  papel?: "admin" | "suporte";
  congregacaoId?: number;
};

type CorpoAtualizacaoUsuario = {
  usuarioId?: number;
  ativo?: boolean;
  nome?: string;
  telefone?: string | null;
  papel?: "admin" | "suporte";
  congregacaoId?: number;
};

type PerfilSolicitante = {
  id: number;
  nome: string;
  papel: PapelUsuario;
  congregacao_id: number | null;
  ativo: boolean;
  auth_user_id: string | null;
};

function respostaErro(
  mensagem: string,
  status: number,
  detalhes?: unknown
) {
  if (detalhes) {
    console.error(mensagem, detalhes);
  }

  return NextResponse.json(
    {
      ok: false,
      erro: mensagem,
    },
    {
      status,
    }
  );
}

function obterToken(request: NextRequest) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  return authorization.slice(7).trim();
}

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function gerarSenhaTemporaria(
  tamanho = 12
) {
  const maiusculas =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";

  const minusculas =
    "abcdefghijkmnopqrstuvwxyz";

  const numeros = "23456789";
  const simbolos = "!@#$%&*?";

  const todos =
    maiusculas +
    minusculas +
    numeros +
    simbolos;

  const caracteres = [
    maiusculas[
      randomInt(maiusculas.length)
    ],
    minusculas[
      randomInt(minusculas.length)
    ],
    numeros[randomInt(numeros.length)],
    simbolos[randomInt(simbolos.length)],
  ];

  while (
    caracteres.length < tamanho
  ) {
    caracteres.push(
      todos[randomInt(todos.length)]
    );
  }

  for (
    let indice =
      caracteres.length - 1;
    indice > 0;
    indice -= 1
  ) {
    const outroIndice =
      randomInt(indice + 1);

    [
      caracteres[indice],
      caracteres[outroIndice],
    ] = [
      caracteres[outroIndice],
      caracteres[indice],
    ];
  }

  return caracteres.join("");
}

async function buscarSolicitante(
  authUserId: string
): Promise<PerfilSolicitante | null> {
  const { data, error } =
    await supabaseAdmin
      .from("usuarios_app")
      .select(`
        id,
        nome,
        papel,
        congregacao_id,
        ativo,
        auth_user_id
      `)
      .eq(
        "auth_user_id",
        authUserId
      )
      .eq("ativo", true)
      .maybeSingle();

  console.log(
    "DEBUG BUSCAR SOLICITANTE:",
    {
      authUserIdRecebido:
        authUserId,
      perfilEncontrado: data,
      erroConsulta: error,
    }
  );

  if (error) {
    console.error(
      "Erro ao buscar perfil solicitante:",
      error
    );

    return null;
  }

  return data as
    | PerfilSolicitante
    | null;
}

async function autenticarAdministrador(
  request: NextRequest
) {
  const token = obterToken(request);

  if (!token) {
    return {
      erro: respostaErro(
        "Sessão não informada.",
        401
      ),
      usuarioAuth: null,
      perfil: null,
    };
  }

  const {
    data: dadosAuth,
    error: erroAuth,
  } =
    await supabaseAdmin.auth.getUser(
      token
    );

  if (
    erroAuth ||
    !dadosAuth.user
  ) {
    return {
      erro: respostaErro(
        "Sessão inválida ou expirada.",
        401,
        erroAuth
      ),
      usuarioAuth: null,
      perfil: null,
    };
  }

  console.log(
    "DEBUG USUÁRIO AUTH:",
    {
      id: dadosAuth.user.id,
      email:
        dadosAuth.user.email,
    }
  );

  const perfil =
    await buscarSolicitante(
      dadosAuth.user.id
    );

  if (!perfil) {
    return {
      erro: respostaErro(
        "Perfil administrativo não encontrado ou inativo.",
        403
      ),
      usuarioAuth: null,
      perfil: null,
    };
  }

  if (
    perfil.papel !==
      "superadmin" &&
    perfil.papel !== "admin"
  ) {
    return {
      erro: respostaErro(
        "Você não possui permissão para administrar usuários.",
        403
      ),
      usuarioAuth: null,
      perfil: null,
    };
  }

  return {
    erro: null,
    usuarioAuth:
      dadosAuth.user,
    perfil,
  };
}

/*
 * LISTAR USUÁRIOS
 */
export async function GET(
  request: NextRequest
) {
  const autenticacao =
    await autenticarAdministrador(
      request
    );

  if (
    autenticacao.erro ||
    !autenticacao.perfil
  ) {
    return autenticacao.erro;
  }

  const perfilSolicitante =
    autenticacao.perfil;

  let consulta = supabaseAdmin
    .from("usuarios_app")
    .select(`
      id,
      nome,
      nome_usuario,
      email,
      telefone,
      papel,
      congregacao_id,
      ativo,
      auth_user_id,
      deve_trocar_senha,
      ultimo_login,
      created_at,
      congregacoes (
        id,
        nome
      )
    `)
    .in("papel", [
      "superadmin",
      "admin",
      "suporte",
    ])
    .order("nome");

  if (
    perfilSolicitante.papel ===
    "admin"
  ) {
    consulta = consulta.eq(
      "congregacao_id",
      perfilSolicitante.congregacao_id
    );
  }

  const { data, error } =
    await consulta;

  if (error) {
    return respostaErro(
      "Não foi possível carregar os usuários.",
      500,
      error
    );
  }

  return NextResponse.json({
    ok: true,
    usuarios: data ?? [],
    solicitante: {
      papel:
        perfilSolicitante.papel,
      congregacaoId:
        perfilSolicitante.congregacao_id,
    },
  });
}

/*
 * CRIAR USUÁRIO
 */
export async function POST(
  request: NextRequest
) {
  const autenticacao =
    await autenticarAdministrador(
      request
    );

  if (
    autenticacao.erro ||
    !autenticacao.perfil ||
    !autenticacao.usuarioAuth
  ) {
    return autenticacao.erro;
  }

  let corpo: CorpoCriacaoUsuario;

  try {
    corpo =
      (await request.json()) as CorpoCriacaoUsuario;
  } catch {
    return respostaErro(
      "Dados enviados são inválidos.",
      400
    );
  }

  const nome = corpo.nome
    ?.trim()
    .replace(/\s+/g, " ");

  const email = corpo.email
    ?.trim()
    .toLowerCase();

  const telefone =
    corpo.telefone?.trim() ||
    null;

  const papel = corpo.papel;

  const congregacaoId = Number(
    corpo.congregacaoId
  );

  const usuarioAppId =
    corpo.usuarioAppId
      ? Number(corpo.usuarioAppId)
      : null;

  if (!nome) {
    return respostaErro(
      "Informe o nome do usuário.",
      400
    );
  }

  if (
    !email ||
    !emailValido(email)
  ) {
    return respostaErro(
      "Informe um e-mail válido.",
      400
    );
  }

  if (
    papel !== "admin" &&
    papel !== "suporte"
  ) {
    return respostaErro(
      "O papel informado é inválido.",
      400
    );
  }

  if (
    !Number.isInteger(
      congregacaoId
    ) ||
    congregacaoId <= 0
  ) {
    return respostaErro(
      "Selecione uma congregação válida.",
      400
    );
  }

  const solicitante =
    autenticacao.perfil;

  if (
    solicitante.papel ===
    "admin"
  ) {
    if (papel !== "suporte") {
      return respostaErro(
        "Administradores podem criar apenas usuários de suporte.",
        403
      );
    }

    if (
      solicitante.congregacao_id !==
      congregacaoId
    ) {
      return respostaErro(
        "Você só pode criar usuários para sua própria congregação.",
        403
      );
    }
  }

  const {
    data: congregacao,
    error: erroCongregacao,
  } = await supabaseAdmin
    .from("congregacoes")
    .select("id, nome")
    .eq("id", congregacaoId)
    .maybeSingle();

  if (erroCongregacao) {
    return respostaErro(
      "Não foi possível validar a congregação.",
      500,
      erroCongregacao
    );
  }

  if (!congregacao) {
    return respostaErro(
      "Congregação não encontrada.",
      404
    );
  }

  let perfilExistente: {
    id: number;
    nome: string;
    email: string | null;
    papel: string;
    congregacao_id:
      | number
      | null;
    auth_user_id:
      | string
      | null;
  } | null = null;

  if (usuarioAppId) {
    const { data, error } =
      await supabaseAdmin
        .from("usuarios_app")
        .select(`
          id,
          nome,
          email,
          papel,
          congregacao_id,
          auth_user_id
        `)
        .eq("id", usuarioAppId)
        .maybeSingle();

    if (error) {
      return respostaErro(
        "Não foi possível localizar o perfil existente.",
        500,
        error
      );
    }

    perfilExistente = data;
  } else {
    const { data, error } =
      await supabaseAdmin
        .from("usuarios_app")
        .select(`
          id,
          nome,
          email,
          papel,
          congregacao_id,
          auth_user_id
        `)
        .ilike("email", email)
        .maybeSingle();

    if (error) {
      return respostaErro(
        "Não foi possível verificar o e-mail informado.",
        500,
        error
      );
    }

    perfilExistente = data;
  }

  if (
    perfilExistente?.auth_user_id
  ) {
    return respostaErro(
      "Este usuário já possui uma conta de acesso.",
      409
    );
  }

  if (
    solicitante.papel ===
      "admin" &&
    perfilExistente &&
    perfilExistente.congregacao_id !==
      solicitante.congregacao_id
  ) {
    return respostaErro(
      "Você não pode alterar um usuário de outra congregação.",
      403
    );
  }

  const senhaTemporaria =
    gerarSenhaTemporaria();

  const {
    data: usuarioCriado,
    error: erroCriarAuth,
  } =
    await supabaseAdmin.auth.admin.createUser(
      {
        email,
        password:
          senhaTemporaria,
        email_confirm: true,
        user_metadata: {
          nome,
          papel,
          congregacao_id:
            congregacaoId,
        },
      }
    );

  if (
    erroCriarAuth ||
    !usuarioCriado.user
  ) {
    return respostaErro(
      erroCriarAuth?.message ||
        "Não foi possível criar a conta no Supabase Auth.",
      400,
      erroCriarAuth
    );
  }

  const authUserId =
    usuarioCriado.user.id;

  const dadosPerfil = {
    nome,
    email,
    telefone,
    papel,
    perfil: papel,
    congregacao_id:
      congregacaoId,
    ativo: true,
    auth_user_id:
      authUserId,
    deve_trocar_senha: true,
    criado_por:
      autenticacao.usuarioAuth.id,
    desativado_em: null,
    desativado_por: null,
    updated_at:
      new Date().toISOString(),
  };

  let erroPerfil:
    | unknown
    | null = null;

  let perfilSalvoId:
    | number
    | null = null;

  if (perfilExistente) {
    const { data, error } =
      await supabaseAdmin
        .from("usuarios_app")
        .update(dadosPerfil)
        .eq(
          "id",
          perfilExistente.id
        )
        .select("id")
        .single();

    erroPerfil = error;
    perfilSalvoId =
      data?.id ?? null;
  } else {
    const nomeUsuarioBase =
      email.split("@")[0];

    const { data, error } =
      await supabaseAdmin
        .from("usuarios_app")
        .insert({
          ...dadosPerfil,
          nome_usuario:
            `${nomeUsuarioBase}-${randomInt(
              1000,
              9999
            )}`,
        })
        .select("id")
        .single();

    erroPerfil = error;
    perfilSalvoId =
      data?.id ?? null;
  }

  if (
    erroPerfil ||
    !perfilSalvoId
  ) {
    await supabaseAdmin.auth.admin.deleteUser(
      authUserId
    );

    return respostaErro(
      "A conta foi criada, mas não foi possível salvar o perfil. A operação foi desfeita.",
      500,
      erroPerfil
    );
  }

  const urlAcesso =
    process.env
      .NEXT_PUBLIC_APP_URL ||
    request.nextUrl.origin;

  const mensagemWhatsApp = [
    `Olá, ${nome}.`,
    "",
    "Seu acesso ao Aplicativo de Territórios foi criado.",
    "",
    `E-mail: ${email}`,
    `Senha temporária: ${senhaTemporaria}`,
    `Perfil: ${papel}`,
    `Congregação: ${congregacao.nome}`,
    "",
    `Acesse: ${urlAcesso}/configuracoes`,
    "",
    "No primeiro acesso, altere sua senha.",
  ].join("\n");

  return NextResponse.json(
    {
      ok: true,
      usuario: {
        id: perfilSalvoId,
        authUserId,
        nome,
        email,
        telefone,
        papel,
        congregacaoId,
        congregacaoNome:
          congregacao.nome,
      },
      senhaTemporaria,
      urlAcesso:
        `${urlAcesso}/configuracoes`,
      mensagemWhatsApp,
    },
    {
      status: 201,
    }
  );
}

/*
 * EDITAR, ATIVAR OU DESATIVAR
 */
export async function PATCH(
  request: NextRequest
) {
  const autenticacao =
    await autenticarAdministrador(
      request
    );

  if (
    autenticacao.erro ||
    !autenticacao.perfil ||
    !autenticacao.usuarioAuth
  ) {
    return autenticacao.erro;
  }

  let corpo: CorpoAtualizacaoUsuario;

  try {
    corpo =
      (await request.json()) as CorpoAtualizacaoUsuario;
  } catch {
    return respostaErro(
      "Dados enviados são inválidos.",
      400
    );
  }

  const usuarioId = Number(
    corpo.usuarioId
  );

  if (
    !Number.isInteger(usuarioId) ||
    usuarioId <= 0
  ) {
    return respostaErro(
      "Usuário inválido.",
      400
    );
  }

  const {
    data: usuarioAlvo,
    error: erroUsuario,
  } = await supabaseAdmin
    .from("usuarios_app")
    .select(`
      id,
      nome,
      email,
      papel,
      congregacao_id,
      ativo,
      auth_user_id
    `)
    .eq("id", usuarioId)
    .maybeSingle();

  if (erroUsuario) {
    return respostaErro(
      "Não foi possível localizar o usuário.",
      500,
      erroUsuario
    );
  }

  if (!usuarioAlvo) {
    return respostaErro(
      "Usuário não encontrado.",
      404
    );
  }

  const solicitante =
    autenticacao.perfil;

  if (
    solicitante.papel ===
    "admin"
  ) {
    if (
      usuarioAlvo.congregacao_id !==
      solicitante.congregacao_id
    ) {
      return respostaErro(
        "Você não pode administrar usuários de outra congregação.",
        403
      );
    }

    if (
      usuarioAlvo.papel !==
      "suporte"
    ) {
      return respostaErro(
        "Administradores podem alterar apenas usuários de suporte.",
        403
      );
    }

    if (
      corpo.papel &&
      corpo.papel !== "suporte"
    ) {
      return respostaErro(
        "Administradores não podem promover usuários para administrador.",
        403
      );
    }

    if (
      corpo.congregacaoId &&
      corpo.congregacaoId !==
        solicitante.congregacao_id
    ) {
      return respostaErro(
        "Você não pode mover o usuário para outra congregação.",
        403
      );
    }
  }

  if (
    usuarioAlvo.auth_user_id ===
      autenticacao.usuarioAuth.id &&
    corpo.ativo === false
  ) {
    return respostaErro(
      "Você não pode desativar seu próprio usuário.",
      400
    );
  }

  if (
    usuarioAlvo.papel ===
      "superadmin" &&
    usuarioAlvo.auth_user_id !==
      autenticacao.usuarioAuth.id
  ) {
    return respostaErro(
      "Este superadministrador não pode ser alterado por esta tela.",
      403
    );
  }

  const atualizacoes: Record<
    string,
    unknown
  > = {};

  if (
    typeof corpo.nome ===
    "string"
  ) {
    const nomeLimpo =
      corpo.nome
        .trim()
        .replace(/\s+/g, " ");

    if (!nomeLimpo) {
      return respostaErro(
        "Informe o nome do usuário.",
        400
      );
    }

    atualizacoes.nome =
      nomeLimpo;
  }

  if (
    corpo.telefone !==
    undefined
  ) {
    atualizacoes.telefone =
      corpo.telefone?.trim() ||
      null;
  }

  if (corpo.papel) {
    atualizacoes.papel =
      corpo.papel;

    atualizacoes.perfil =
      corpo.papel;
  }

  if (
    corpo.congregacaoId !==
    undefined
  ) {
    const congregacaoId =
      Number(
        corpo.congregacaoId
      );

    if (
      !Number.isInteger(
        congregacaoId
      ) ||
      congregacaoId <= 0
    ) {
      return respostaErro(
        "Congregação inválida.",
        400
      );
    }

    atualizacoes.congregacao_id =
      congregacaoId;
  }

  if (
    typeof corpo.ativo ===
    "boolean"
  ) {
    if (
      corpo.ativo &&
      !usuarioAlvo.auth_user_id
    ) {
      return respostaErro(
        "Este usuário ainda não possui conta de acesso. Use a opção de criar acesso.",
        400
      );
    }

    atualizacoes.ativo =
      corpo.ativo;

    atualizacoes.desativado_em =
      corpo.ativo
        ? null
        : new Date().toISOString();

    atualizacoes.desativado_por =
      corpo.ativo
        ? null
        : autenticacao.usuarioAuth.id;
  }

  if (
    Object.keys(
      atualizacoes
    ).length === 0
  ) {
    return respostaErro(
      "Nenhuma alteração foi informada.",
      400
    );
  }

  const {
    data: usuarioAtualizado,
    error: erroAtualizar,
  } = await supabaseAdmin
    .from("usuarios_app")
    .update(atualizacoes)
    .eq("id", usuarioId)
    .select(`
      id,
      nome,
      email,
      telefone,
      papel,
      congregacao_id,
      ativo,
      auth_user_id,
      deve_trocar_senha
    `)
    .single();

  if (erroAtualizar) {
    return respostaErro(
      "Não foi possível atualizar o usuário.",
      500,
      erroAtualizar
    );
  }

  return NextResponse.json({
    ok: true,
    usuario:
      usuarioAtualizado,
  });
}