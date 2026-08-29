"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Edit,
  MapPinned,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import BairroDialog, {
  type BairroAdmin,
  type CidadeBairroAdmin,
} from "@/components/admin/bairros/BairroDialog";
import { supabase } from "@/lib/supabase";

type FiltroStatus = "ativos" | "inativos" | "todos";

function BairrosContent() {
  const searchParams = useSearchParams();
  const congregacaoParam = searchParams.get("congregacao");
  const congregacaoQuery = congregacaoParam
    ? Number(congregacaoParam)
    : null;
  const congregacaoQueryValida =
    Number.isInteger(congregacaoQuery) && Number(congregacaoQuery) > 0;
  const { usuario, isAdmin, isSuperAdmin, carregando } = useAuth();

  const [cidades, setCidades] = useState<CidadeBairroAdmin[]>([]);
  const [bairros, setBairros] = useState<BairroAdmin[]>([]);
  const [filtro, setFiltro] = useState<FiltroStatus>("ativos");
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [bairroSelecionado, setBairroSelecionado] =
    useState<BairroAdmin | null>(null);
  const [alterandoId, setAlterandoId] = useState<number | null>(null);

  const rotaVoltar = congregacaoQueryValida
    ? `/configuracoes?congregacao=${congregacaoQuery}`
    : "/configuracoes";

  async function carregarDados() {
    if (!usuario || !isAdmin) return;

    setCarregandoDados(true);

    let consultaCidades = supabase
      .from("cidades")
      .select("id, congregacao_id, nome, ativo")
      .order("nome");

    if (!isSuperAdmin) {
      if (!usuario.congregacao_id) {
        setCidades([]);
        setBairros([]);
        setCarregandoDados(false);
        return;
      }

      consultaCidades = consultaCidades.eq(
        "congregacao_id",
        usuario.congregacao_id
      );
    } else if (congregacaoQueryValida) {
      consultaCidades = consultaCidades.eq(
        "congregacao_id",
        Number(congregacaoQuery)
      );
    }

    const { data: dadosCidades, error: erroCidades } =
      await consultaCidades;

    if (erroCidades) {
      console.error(erroCidades);
      alert("Não foi possível carregar as cidades.");
      setCarregandoDados(false);
      return;
    }

    const cidadesPermitidas = (dadosCidades ?? []) as CidadeBairroAdmin[];
    setCidades(cidadesPermitidas);

    if (cidadesPermitidas.length === 0) {
      setBairros([]);
      setCarregandoDados(false);
      return;
    }

    const { data: dadosBairros, error: erroBairros } = await supabase
      .from("bairros")
      .select("id, congregacao_id, cidade_id, nome, ativo")
      .in(
        "cidade_id",
        cidadesPermitidas.map((cidade) => cidade.id)
      )
      .order("nome");

    setCarregandoDados(false);

    if (erroBairros) {
      console.error(erroBairros);
      alert("Não foi possível carregar os bairros.");
      return;
    }

    setBairros((dadosBairros ?? []) as BairroAdmin[]);
  }

  useEffect(() => {
    if (!usuario || !isAdmin) return;

    queueMicrotask(() => {
      void carregarDados();
    });
  }, [usuario, isAdmin, isSuperAdmin, congregacaoQuery]);

  const cidadePorId = useMemo(
    () => new Map(cidades.map((cidade) => [cidade.id, cidade])),
    [cidades]
  );

  const bairrosFiltrados = useMemo(
    () =>
      bairros.filter((bairro) => {
        if (filtro === "ativos") return bairro.ativo;
        if (filtro === "inativos") return !bairro.ativo;
        return true;
      }),
    [bairros, filtro]
  );

  function novoBairro() {
    setBairroSelecionado(null);
    setDialogAberto(true);
  }

  function editarBairro(bairro: BairroAdmin) {
    setBairroSelecionado(bairro);
    setDialogAberto(true);
  }

  function fecharDialog() {
    setDialogAberto(false);
    setBairroSelecionado(null);
  }

  async function alternarAtivo(bairro: BairroAdmin) {
    const cidade = cidadePorId.get(bairro.cidade_id);
    if (!cidade) {
      alert("A cidade deste bairro não está disponível para seu usuário.");
      return;
    }

    if (bairro.ativo) {
      const confirmar = confirm(
        `Inativar o bairro "${bairro.nome}"?\n\n` +
          "Ele deixará de aparecer nas seleções, mas continuará salvo no banco."
      );
      if (!confirmar) return;
    }

    setAlterandoId(bairro.id);

    const { data, error } = await supabase
      .from("bairros")
      .update({
        ativo: !bairro.ativo,
        congregacao_id: cidade.congregacao_id,
      })
      .eq("id", bairro.id)
      .eq("cidade_id", cidade.id)
      .select("id, ativo")
      .maybeSingle();

    setAlterandoId(null);

    if (error || !data) {
      console.error(error);
      alert(
        error
          ? `Não foi possível alterar o bairro: ${error.message}`
          : "O bairro não foi alterado. Verifique sua permissão."
      );
      return;
    }

    await carregarDados();
  }

  if (carregando) {
    return <Mensagem>Verificando acesso...</Mensagem>;
  }

  if (!usuario || !isAdmin) {
    return (
      <Mensagem erro>
        Você não possui permissão para acessar esta página.
      </Mensagem>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
              Configurações
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Bairros</h1>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            aria-label="Atualizar bairros"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={novoBairro}
          disabled={!cidades.some((cidade) => cidade.ativo)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Plus className="h-4 w-4" />
          Novo bairro
        </button>

        <section className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Filtrar por status
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["ativos", "inativos", "todos"] as FiltroStatus[]).map(
              (opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltro(opcao)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
                    filtro === opcao
                      ? "bg-violet-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {opcao}
                </button>
              )
            )}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {bairrosFiltrados.length} bairro(s) encontrado(s).
          </p>
        </section>

        {carregandoDados ? (
          <div className="rounded-3xl bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            Carregando bairros...
          </div>
        ) : bairrosFiltrados.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            Nenhum bairro encontrado neste filtro.
          </div>
        ) : (
          <div className="space-y-3">
            {bairrosFiltrados.map((bairro) => {
              const cidade = cidadePorId.get(bairro.cidade_id);
              return (
                <article
                  key={bairro.id}
                  className={`rounded-3xl bg-white p-4 shadow-sm ring-1 ${
                    bairro.ativo ? "ring-slate-200" : "ring-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                        bairro.ativo
                          ? "bg-violet-100 text-violet-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <MapPinned className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900">
                          {bairro.nome}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            bairro.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {bairro.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                        <Building2 className="h-4 w-4" />
                        {cidade?.nome ?? "Cidade não encontrada"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => editarBairro(bairro)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 py-2.5 text-sm font-semibold text-violet-700"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarAtivo(bairro)}
                      disabled={alterandoId === bairro.id}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60 ${
                        bairro.ativo
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      {alterandoId === bairro.id
                        ? "Alterando..."
                        : bairro.ativo
                          ? "Inativar"
                          : "Reativar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <BairroDialog
        aberto={dialogAberto}
        cidades={cidades}
        bairro={bairroSelecionado}
        fechar={fecharDialog}
        aoSalvar={carregarDados}
      />
    </main>
  );
}

function Mensagem({
  children,
  erro = false,
}: {
  children: React.ReactNode;
  erro?: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div
        className={`mx-auto max-w-3xl rounded-2xl p-4 text-sm ${
          erro
            ? "border border-red-200 bg-red-50 text-red-700"
            : "bg-white text-slate-500"
        }`}
      >
        {children}
      </div>
    </main>
  );
}

export default function BairrosPage() {
  return (
    <Suspense fallback={<Mensagem>Carregando bairros...</Mensagem>}>
      <BairrosContent />
    </Suspense>
  );
}
