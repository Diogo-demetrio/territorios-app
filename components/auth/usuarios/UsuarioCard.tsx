"use client";

import {
  Building2,
  Edit,
  Mail,
  Power,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  UsuarioAdmin,
} from "@/components/auth/usuarios/types";

type Props = {
  usuario: UsuarioAdmin;
  podeEditar: boolean;
  alterandoAtivo: boolean;
  onEditar: (
    usuario: UsuarioAdmin
  ) => void;
  onAlternarAtivo: (
    usuario: UsuarioAdmin
  ) => void;
};

function obterNomeCongregacao(
  usuario: UsuarioAdmin
) {
  if (
    Array.isArray(usuario.congregacoes)
  ) {
    return (
      usuario.congregacoes[0]?.nome ??
      "Sem congregação"
    );
  }

  return (
    usuario.congregacoes?.nome ??
    "Sem congregação"
  );
}

function obterTituloPapel(
  papel: UsuarioAdmin["papel"]
) {
  if (papel === "superadmin") {
    return "Superadministrador";
  }

  if (papel === "admin") {
    return "Administrador";
  }

  return "Suporte";
}

export default function UsuarioCard({
  usuario,
  podeEditar,
  alterandoAtivo,
  onEditar,
  onAlternarAtivo,
}: Props) {
  const possuiAcesso =
    Boolean(usuario.auth_user_id);

  const congregacaoNome =
    obterNomeCongregacao(usuario);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <UserRound className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-slate-900">
                {usuario.nome}
              </h3>

              <p className="mt-0.5 truncate text-sm text-slate-500">
                {usuario.email ||
                  "E-mail ainda não informado"}
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                usuario.papel ===
                "superadmin"
                  ? "bg-amber-100 text-amber-800"
                  : usuario.papel ===
                      "admin"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {obterTituloPapel(
                usuario.papel
              )}
            </span>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

              <span className="truncate">
                {congregacaoNome}
              </span>
            </div>

            {usuario.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                <span className="truncate">
                  {usuario.email}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />

              <span>
                {possuiAcesso
                  ? "Conta de acesso criada"
                  : "Acesso ainda não criado"}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                usuario.ativo
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {usuario.ativo
                ? "Ativo"
                : "Inativo"}
            </span>

            {usuario.deve_trocar_senha &&
              possuiAcesso && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  Troca de senha pendente
                </span>
              )}
          </div>
        </div>
      </div>

      {podeEditar && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              onEditar(usuario)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-xs font-semibold text-violet-700"
          >
            <Edit className="h-4 w-4" />
            Editar
          </button>

          <button
            type="button"
            onClick={() =>
              onAlternarAtivo(usuario)
            }
            disabled={
              alterandoAtivo ||
              !possuiAcesso
            }
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
              usuario.ativo
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            <Power className="h-4 w-4" />

            {alterandoAtivo
              ? "Salvando..."
              : usuario.ativo
                ? "Desativar"
                : "Ativar"}
          </button>
        </div>
      )}

      {!possuiAcesso && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Este cadastro ainda não possui uma conta no Supabase Auth.
          Use a opção Editar para criar o acesso.
        </p>
      )}
    </article>
  );
}