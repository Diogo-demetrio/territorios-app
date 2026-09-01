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
    <main className="min-h-screen bg-[#F4F5F0] px-4 py-5 pb-24 [font-family:var(--font-geist-sans),Arial,sans-serif] text-[#17211C] sm:py-7">
      <div className="mx-auto max-w-[900px]">
        <header className="mb-5 flex items-center gap-3">
          <Link
            href={rotaVoltar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] active:bg-[#F4F5F0]"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2F6B4F]">
              Configurações
            </p>
            <h1 className="text-2xl font-bold text-[#17211C] sm:text-3xl">Bairros</h1>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#DDE2DB] bg-white text-[#123D2C] shadow-[0_3px_12px_rgba(23,33,28,0.05)] transition hover:border-[#8FAF72] hover:bg-[#F4F5F0] active:bg-[#DCE8D5]"
            aria-label="Atualizar bairros"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </header>

        <button
          type="button"
          onClick={novoBairro}
          disabled={!cidades.some((cidade) => cidade.ativo)}
          className="mb-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#123D2C] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B2B20] active:opacity-90 disabled:cursor-not-allowed disabled:bg-[#AAB3AC]"
        >
          <Plus className="h-4 w-4" />
          Novo bairro
        </button>

        <section className="mb-4 rounded-[18px] border border-[#DDE2DB] bg-white p-3 shadow-[0_4px_16px_rgba(23,33,28,0.04)] sm:p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6F7872]">
            Filtrar por status
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-[14px] bg-[#F4F5F0] p-1">
            {(["ativos", "inativos", "todos"] as FiltroStatus[]).map(
              (opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setFiltro(opcao)}
                  className={`min-h-10 rounded-[11px] px-2 py-2 text-sm font-semibold capitalize transition ${
                    filtro === opcao
                      ? "bg-[#123D2C] text-white shadow-sm"
                      : "bg-transparent text-[#6F7872] hover:bg-white"
                  }`}
                >
                  {opcao}
                </button>
              )
            )}
          </div>
          <p className="mt-2 px-1 text-xs text-[#6F7872]">
            {bairrosFiltrados.length} bairro(s) encontrado(s).
          </p>
        </section>

        {carregandoDados ? (
          <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-5 text-sm text-[#6F7872] shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
            Carregando bairros...
          </div>
        ) : bairrosFiltrados.length === 0 ? (
          <div className="rounded-[16px] border border-[#DDE2DB] bg-white p-5 text-center text-sm text-[#6F7872] shadow-[0_4px_16px_rgba(23,33,28,0.04)]">
            Nenhum bairro encontrado neste filtro.
          </div>
        ) : (
          <div className="space-y-3">
            {bairrosFiltrados.map((bairro) => {
              const cidade = cidadePorId.get(bairro.cidade_id);
              return (
                <article
                  key={bairro.id}
                  className="rounded-[20px] border border-[#DDE2DB] bg-white p-4 shadow-[0_4px_16px_rgba(23,33,28,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#DCE8D5] text-[#123D2C]"
                    >
                      <MapPinned className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-semibold text-[#17211C]">
                          {bairro.nome}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            bairro.ativo
                              ? "bg-[#DCE8D5] text-[#24543F]"
                              : "bg-[#E9ECE5] text-[#59635D]"
                          }`}
                        >
                          {bairro.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6F7872]">
                        <Building2 className="h-4 w-4 text-[#2F6B4F]" />
                        {cidade?.nome ?? "Cidade não encontrada"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#DDE2DB] pt-3">
                    <button
                      type="button"
                      onClick={() => editarBairro(bairro)}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE2DB] bg-[#DCE8D5]/50 py-2.5 text-sm font-semibold text-[#123D2C] transition hover:border-[#8FAF72] active:bg-[#DCE8D5]"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarAtivo(bairro)}
                      disabled={alterandoId === bairro.id}
                      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                        bairro.ativo
                          ? "border-[#B84A4A]/20 bg-[#B84A4A]/8 text-[#9B3F3F] hover:border-[#B84A4A]/35"
                          : "border-[#8FAF72]/40 bg-[#DCE8D5]/60 text-[#123D2C] hover:border-[#8FAF72]"
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      {alterandoId === bairro.id
                        ? "Alterando..."
                        : bairro.ativo
                          ? "Inativar"
                          : "Ativar"}
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
    <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans),Arial,sans-serif]">
      <div
        className={`mx-auto max-w-[900px] rounded-[16px] p-4 text-sm ${
          erro
            ? "border border-[#B84A4A]/25 bg-[#B84A4A]/8 text-[#8F3636]"
            : "border border-[#DDE2DB] bg-white text-[#6F7872]"
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
