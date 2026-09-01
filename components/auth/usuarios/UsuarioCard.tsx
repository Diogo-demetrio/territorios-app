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
    <article className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_4px_16px_rgba(23,33,28,0.04)] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]">
          <UserRound className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[#17211C]">
                {usuario.nome}
              </h3>

              <p className="mt-0.5 break-all text-sm text-[#6F7872]">
                {usuario.email ||
                  "E-mail ainda não informado"}
              </p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                usuario.papel ===
                "superadmin"
                  ? "bg-[#123D2C] text-white"
                  : usuario.papel ===
                      "admin"
                    ? "bg-[#DCE8D5] text-[#123D2C]"
                    : "bg-[#E8F0F5] text-[#355F78]"
              }`}
            >
              {obterTituloPapel(
                usuario.papel
              )}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-xs text-[#6F7872]">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[#2F6B4F]" />

              <span className="min-w-0 break-words">
                {congregacaoNome}
              </span>
            </div>

            {usuario.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#2F6B4F]" />

                <span className="min-w-0 break-all">
                  {usuario.email}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#2F6B4F]" />

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
                  ? "bg-[#DCE8D5] text-[#24543F]"
                  : "bg-[#E9ECE5] text-[#59635D]"
              }`}
            >
              {usuario.ativo
                ? "Ativo"
                : "Inativo"}
            </span>

            {usuario.deve_trocar_senha &&
              possuiAcesso && (
                <span className="rounded-full bg-[#B78335]/12 px-2.5 py-1 text-xs font-semibold text-[#805A23]">
                  Troca de senha pendente
                </span>
              )}
          </div>
        </div>
      </div>

      {podeEditar && (
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#DDE2DB] pt-4">
          <button
            type="button"
            onClick={() =>
              onEditar(usuario)
            }
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-[#DCE8D5]/60 px-3 py-2.5 text-xs font-semibold text-[#123D2C] transition hover:border-[#8FAF72] active:bg-[#DCE8D5]"
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
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              usuario.ativo
                ? "border-[#B84A4A]/20 bg-[#B84A4A]/8 text-[#9B3F3F] hover:border-[#B84A4A]/35"
                : "border-[#8FAF72]/40 bg-[#DCE8D5]/60 text-[#123D2C] hover:border-[#8FAF72]"
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
        <p className="mt-3 rounded-xl border border-[#B78335]/20 bg-[#B78335]/10 px-3 py-2 text-xs text-[#805A23]">
          Este cadastro ainda não possui uma conta no Supabase Auth.
          Use a opção Editar para criar o acesso.
        </p>
      )}
    </article>
  );
}
