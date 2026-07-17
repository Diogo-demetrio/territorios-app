"use client";

import {
  Plus,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import {
  atualizarUsuario,
  listarUsuarios,
} from "@/components/auth/usuarios/UsuarioApi";

import UsuarioCard from "@/components/auth/usuarios/UsuarioCard";
import UsuarioDialog from "@/components/auth/usuarios/UsuarioDialog";
import ConviteUsuarioDialog from "@/components/auth/usuarios/ConviteUsuarioDialog";

import type {
  CongregacaoUsuario,
  PermissoesUsuarios,
  ResultadoConvite,
  UsuarioAdmin,
} from "@/components/auth/usuarios/types";

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] =
    useState<UsuarioAdmin[]>([]);

  const [congregacoes, setCongregacoes] =
    useState<CongregacaoUsuario[]>([]);

  const [permissoes, setPermissoes] =
    useState<PermissoesUsuarios | null>(
      null
    );

  const [busca, setBusca] =
    useState("");

  const [
    mostrarInativos,
    setMostrarInativos,
  ] = useState(true);

  const [carregando, setCarregando] =
    useState(true);

  const [
    atualizandoUsuarioId,
    setAtualizandoUsuarioId,
  ] = useState<number | null>(null);

  const [
    dialogAberto,
    setDialogAberto,
  ] = useState(false);

  const [
    usuarioSelecionado,
    setUsuarioSelecionado,
  ] = useState<UsuarioAdmin | null>(
    null
  );

  const [
    resultadoConvite,
    setResultadoConvite,
  ] = useState<ResultadoConvite | null>(
    null
  );

  async function carregarDados() {
    setCarregando(true);

    try {
      const [
        respostaUsuarios,
        respostaCongregacoes,
      ] = await Promise.all([
        listarUsuarios(),

        supabase
          .from("congregacoes")
          .select("id, nome")
          .eq("ativa", true)
          .order("nome"),
      ]);

      if (
        respostaCongregacoes.error
      ) {
        throw new Error(
          "Não foi possível carregar as congregações."
        );
      }

      setUsuarios(
        respostaUsuarios.usuarios
      );

      setPermissoes(
        respostaUsuarios.solicitante
      );

      setCongregacoes(
        (respostaCongregacoes.data ??
          []) as CongregacaoUsuario[]
      );
    } catch (erro) {
      console.error(erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar os usuários."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const usuariosFiltrados =
    useMemo(() => {
      const texto = busca
        .trim()
        .toLowerCase();

      return usuarios.filter(
        (usuario) => {
          if (
            !mostrarInativos &&
            !usuario.ativo
          ) {
            return false;
          }

          if (!texto) {
            return true;
          }

          const congregacao =
            Array.isArray(
              usuario.congregacoes
            )
              ? usuario
                  .congregacoes[0]
                  ?.nome ?? ""
              : usuario
                  .congregacoes
                  ?.nome ?? "";

          return [
            usuario.nome,
            usuario.email,
            usuario.nome_usuario,
            usuario.papel,
            congregacao,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(texto);
        }
      );
    }, [
      usuarios,
      busca,
      mostrarInativos,
    ]);

  function abrirNovoUsuario() {
    setUsuarioSelecionado(null);
    setDialogAberto(true);
  }

  function abrirEditarUsuario(
    usuario: UsuarioAdmin
  ) {
    setUsuarioSelecionado(usuario);
    setDialogAberto(true);
  }

  function fecharDialog() {
    setDialogAberto(false);
    setUsuarioSelecionado(null);
  }

  function podeEditarUsuario(
    usuario: UsuarioAdmin
  ) {
    if (!permissoes) {
      return false;
    }

    if (
      permissoes.papel ===
      "superadmin"
    ) {
      return true;
    }

    return (
      permissoes.papel === "admin" &&
      usuario.papel === "suporte" &&
      usuario.congregacao_id ===
        permissoes.congregacaoId
    );
  }

  async function alternarAtivo(
    usuario: UsuarioAdmin
  ) {
    const acao = usuario.ativo
      ? "desativar"
      : "ativar";

    const confirmou = confirm(
      `Deseja ${acao} o usuário "${usuario.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    setAtualizandoUsuarioId(
      usuario.id
    );

    try {
      await atualizarUsuario({
        usuarioId: usuario.id,
        ativo: !usuario.ativo,
      });

      await carregarDados();
    } catch (erro) {
      console.error(erro);

      alert(
        erro instanceof Error
          ? erro.message
          : "Não foi possível alterar o usuário."
      );
    } finally {
      setAtualizandoUsuarioId(
        null
      );
    }
  }

  function exibirConvite(
    resultado: ResultadoConvite
  ) {
    setResultadoConvite(
      resultado
    );
  }

  if (carregando) {
    return (
      <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
        Carregando usuários...
      </div>
    );
  }

  if (!permissoes) {
    return (
      <div className="mt-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Não foi possível validar suas permissões.
      </div>
    );
  }

  return (
    <>
      <section className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Usuários
              </h2>

              <p className="text-sm text-slate-500">
                Administradores e suportes do aplicativo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600"
            aria-label="Atualizar usuários"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={abrirNovoUsuario}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Novo usuário
        </button>

        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              value={busca}
              onChange={(event) =>
                setBusca(
                  event.target.value
                )
              }
              placeholder="Buscar por nome, e-mail ou congregação"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={mostrarInativos}
              onChange={(event) =>
                setMostrarInativos(
                  event.target.checked
                )
              }
              className="h-4 w-4"
            />

            Mostrar usuários inativos
          </label>

          <p className="text-xs text-slate-500">
            {usuariosFiltrados.length} usuário(s) encontrado(s).
          </p>
        </div>

        {usuariosFiltrados.length ===
        0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="space-y-3">
            {usuariosFiltrados.map(
              (usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  podeEditar={podeEditarUsuario(
                    usuario
                  )}
                  alterandoAtivo={
                    atualizandoUsuarioId ===
                    usuario.id
                  }
                  onEditar={
                    abrirEditarUsuario
                  }
                  onAlternarAtivo={
                    alternarAtivo
                  }
                />
              )
            )}
          </div>
        )}
      </section>

      <UsuarioDialog
        aberto={dialogAberto}
        usuario={usuarioSelecionado}
        congregacoes={congregacoes}
        papelSolicitante={
          permissoes.papel
        }
        congregacaoSolicitanteId={
          permissoes.congregacaoId
        }
        fechar={fecharDialog}
        aoSalvar={carregarDados}
        aoCriarConvite={
          exibirConvite
        }
      />

      <ConviteUsuarioDialog
        aberto={Boolean(
          resultadoConvite
        )}
        resultado={resultadoConvite}
        fechar={() =>
          setResultadoConvite(null)
        }
      />
    </>
  );
}