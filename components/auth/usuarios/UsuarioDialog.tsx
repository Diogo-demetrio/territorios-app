"use client";

import {
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  atualizarUsuario,
  criarUsuario,
} from "@/components/auth/usuarios/UsuarioApi";

import type {
  CongregacaoUsuario,
  DadosCriarUsuario,
  PapelUsuario,
  ResultadoConvite,
  UsuarioAdmin,
} from "@/components/auth/usuarios/types";

type Props = {
  aberto: boolean;
  usuario: UsuarioAdmin | null;
  congregacoes: CongregacaoUsuario[];
  papelSolicitante: PapelUsuario;
  congregacaoSolicitanteId: number | null;
  fechar: () => void;
  aoSalvar: () => Promise<void> | void;
  aoCriarConvite: (
    resultado: ResultadoConvite
  ) => void;
};

export default function UsuarioDialog({
  aberto,
  usuario,
  congregacoes,
  papelSolicitante,
  congregacaoSolicitanteId,
  fechar,
  aoSalvar,
  aoCriarConvite,
}: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] =
    useState("");
  const [papel, setPapel] =
    useState<"admin" | "suporte">(
      "suporte"
    );
  const [
    congregacaoId,
    setCongregacaoId,
  ] = useState("");
  const [salvando, setSalvando] =
    useState(false);

  const editando = Boolean(usuario);
  const possuiAcesso = Boolean(
    usuario?.auth_user_id
  );

  const isSuperAdmin =
    papelSolicitante === "superadmin";

  useEffect(() => {
    if (!aberto) return;

    setNome(usuario?.nome ?? "");
    setEmail(usuario?.email ?? "");
    setTelefone(usuario?.telefone ?? "");

    setPapel(
      usuario?.papel === "admin"
        ? "admin"
        : "suporte"
    );

    const congregacaoInicial =
      usuario?.congregacao_id ??
      congregacaoSolicitanteId ??
      congregacoes[0]?.id ??
      null;

    setCongregacaoId(
      congregacaoInicial
        ? String(congregacaoInicial)
        : ""
    );
  }, [
    aberto,
    usuario,
    congregacaoSolicitanteId,
    congregacoes,
  ]);

  if (!aberto) return null;

  function validarFormulario() {
    const nomeLimpo = nome
      .trim()
      .replace(/\s+/g, " ");

    const emailLimpo = email
      .trim()
      .toLowerCase();

    if (!nomeLimpo) {
      alert("Informe o nome.");
      return null;
    }

    if (
      !emailLimpo ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpo
      )
    ) {
      alert("Informe um e-mail válido.");
      return null;
    }

    const congregacaoNumero =
      Number(congregacaoId);

    if (
      !Number.isInteger(
        congregacaoNumero
      ) ||
      congregacaoNumero <= 0
    ) {
      alert("Selecione uma congregação.");
      return null;
    }

    if (
      papelSolicitante === "admin" &&
      papel !== "suporte"
    ) {
      alert(
        "Administradores podem criar apenas usuários de suporte."
      );
      return null;
    }

    return {
      nomeLimpo,
      emailLimpo,
      congregacaoNumero,
    };
  }

  async function salvar() {
    const dadosValidados =
      validarFormulario();

    if (!dadosValidados) return;

    setSalvando(true);

    try {
      /*
       * Cadastro antigo sem auth_user_id:
       * cria a conta real no Supabase Auth.
       */
      if (
        !editando ||
        !possuiAcesso
      ) {
        const dadosCriacao: DadosCriarUsuario =
          {
            usuarioAppId:
              usuario?.id ?? null,
            nome:
              dadosValidados.nomeLimpo,
            email:
              dadosValidados.emailLimpo,
            telefone:
              telefone.trim() || null,
            papel,
            congregacaoId:
              dadosValidados.congregacaoNumero,
          };

        const resposta =
          await criarUsuario(
            dadosCriacao
          );

        await aoSalvar();
        fechar();

        aoCriarConvite({
          usuario: resposta.usuario,
          senhaTemporaria:
            resposta.senhaTemporaria,
          urlAcesso:
            resposta.urlAcesso,
          mensagemWhatsApp:
            resposta.mensagemWhatsApp,
        });

        return;
      }

      /*
       * Usuário que já possui Auth:
       * atualiza apenas dados administrativos.
       */
      if (!usuario) {
  throw new Error(
    "Usuário não encontrado para edição."
  );
}

await atualizarUsuario({
  usuarioId: usuario.id,
        nome:
          dadosValidados.nomeLimpo,
        telefone:
          telefone.trim() || null,
        papel,
        congregacaoId:
          dadosValidados.congregacaoNumero,
      });

      await aoSalvar();
      fechar();
    } catch (erro) {
      console.error(erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar o usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editando
                  ? possuiAcesso
                    ? "Editar usuário"
                    : "Criar acesso"
                  : "Novo usuário"}
              </h2>

              <p className="text-sm text-slate-500">
                {possuiAcesso
                  ? "Atualize os dados administrativos."
                  : "Será criada uma conta com senha temporária."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Campo
          titulo="Nome"
          icone={UserRound}
        >
          <input
            autoFocus
            value={nome}
            onChange={(event) =>
              setNome(event.target.value)
            }
            placeholder="Nome completo"
            className="w-full bg-transparent text-sm outline-none"
          />
        </Campo>

        <Campo
          titulo="E-mail"
          icone={Mail}
        >
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            disabled={possuiAcesso}
            placeholder="usuario@email.com"
            className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400"
          />
        </Campo>

        {possuiAcesso && (
          <p className="-mt-2 mb-3 text-xs text-slate-500">
            O e-mail de acesso não pode ser alterado nesta etapa.
          </p>
        )}

        <Campo
          titulo="Telefone/WhatsApp"
          icone={Phone}
        >
          <input
            type="tel"
            value={telefone}
            onChange={(event) =>
              setTelefone(
                event.target.value
              )
            }
            placeholder="Ex.: 48999999999"
            className="w-full bg-transparent text-sm outline-none"
          />
        </Campo>

        <Campo
          titulo="Congregação"
          icone={Building2}
        >
          <select
            value={congregacaoId}
            onChange={(event) =>
              setCongregacaoId(
                event.target.value
              )
            }
            disabled={!isSuperAdmin}
            className="w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-500"
          >
            <option value="">
              Selecione
            </option>

            {congregacoes.map(
              (congregacao) => (
                <option
                  key={congregacao.id}
                  value={congregacao.id}
                >
                  {congregacao.nome}
                </option>
              )
            )}
          </select>
        </Campo>

        <Campo
          titulo="Papel"
          icone={ShieldCheck}
        >
          <select
            value={papel}
            onChange={(event) =>
              setPapel(
                event.target.value as
                  | "admin"
                  | "suporte"
              )
            }
            className="w-full bg-transparent text-sm outline-none"
          >
            <option value="suporte">
              Suporte
            </option>

            {isSuperAdmin && (
              <option value="admin">
                Administrador
              </option>
            )}
          </select>
        </Campo>

        {!possuiAcesso && (
          <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            Ao salvar, será gerada uma senha temporária. Ela será
            exibida uma única vez junto com a mensagem pronta para
            WhatsApp.
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={fechar}
            disabled={salvando}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="flex-1 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {salvando
              ? "Salvando..."
              : possuiAcesso
                ? "Salvar alterações"
                : "Criar acesso"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({
  titulo,
  icone: Icon,
  children,
}: {
  titulo: string;
  icone: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">
        {titulo}
      </span>

      <span className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 focus-within:border-violet-500">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />

        {children}
      </span>
    </label>
  );
}