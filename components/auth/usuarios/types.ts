export type PapelUsuario =
  | "superadmin"
  | "admin"
  | "suporte";

export type CongregacaoUsuario = {
  id: number;
  nome: string;
};

export type UsuarioAdmin = {
  id: number;
  nome: string;
  nome_usuario: string | null;
  email: string | null;
  telefone: string | null;
  papel: PapelUsuario;
  congregacao_id: number | null;
  ativo: boolean;
  auth_user_id: string | null;
  deve_trocar_senha: boolean;
  ultimo_login: string | null;
  created_at: string | null;
  congregacoes:
    | CongregacaoUsuario
    | CongregacaoUsuario[]
    | null;
};

export type PermissoesUsuarios = {
  papel: PapelUsuario;
  congregacaoId: number | null;
};

export type RespostaListaUsuarios = {
  ok: true;
  usuarios: UsuarioAdmin[];
  solicitante: PermissoesUsuarios;
};

export type DadosCriarUsuario = {
  usuarioAppId?: number | null;
  nome: string;
  email: string;
  telefone?: string | null;
  papel: "admin" | "suporte";
  congregacaoId: number;
};

export type UsuarioCriado = {
  id: number;
  authUserId: string;
  nome: string;
  email: string;
  telefone: string | null;
  papel: "admin" | "suporte";
  congregacaoId: number;
  congregacaoNome: string;
};

export type RespostaCriarUsuario = {
  ok: true;
  usuario: UsuarioCriado;
  senhaTemporaria: string;
  urlAcesso: string;
  mensagemWhatsApp: string;
};

export type DadosAtualizarUsuario = {
  usuarioId: number;
  nome?: string;
  telefone?: string | null;
  papel?: "admin" | "suporte";
  congregacaoId?: number;
  ativo?: boolean;
};

export type RespostaAtualizarUsuario = {
  ok: true;
  usuario: {
    id: number;
    nome: string;
    email: string | null;
    telefone: string | null;
    papel: PapelUsuario;
    congregacao_id: number | null;
    ativo: boolean;
    auth_user_id: string | null;
    deve_trocar_senha: boolean;
  };
};

export type RespostaErroApi = {
  ok: false;
  erro: string;
};

export type ResultadoConvite = {
  usuario: UsuarioCriado;
  senhaTemporaria: string;
  urlAcesso: string;
  mensagemWhatsApp: string;
};