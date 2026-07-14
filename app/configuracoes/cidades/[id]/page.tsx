"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Home,
  Map,
  MapPinned,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CidadeResumo } from "@/components/admin/cidades/CidadeCard";
import BairroDialog, {
  type BairroAdmin,
} from "@/components/admin/bairros/BairroDialog";


export default function CidadeDetalhesPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const cidadeId = Number(params.id);
  const congregacaoId = searchParams.get("congregacao");

  const { usuario, isAdmin, carregando } = useAuth();

  const [cidade, setCidade] =
    useState<CidadeResumo | null>(null);

  const [bairros, setBairros] = useState<BairroAdmin[]>([]);

const [bairroDialogAberto, setBairroDialogAberto] =
  useState(false);

const [bairroSelecionado, setBairroSelecionado] =
  useState<BairroAdmin | null>(null);
  const [carregandoDados, setCarregandoDados] =
    useState(true);

  const rotaVoltar = congregacaoId
    ? `/configuracoes/cidades?congregacao=${congregacaoId}`
    : "/configuracoes/cidades";

  async function carregarDados() {
    setCarregandoDados(true);

    const [resultadoCidade, resultadoBairros] =
      await Promise.all([
        supabase
          .from("v_cidades_resumo")
          .select(`
            id,
            nome,
            ativo,
            total_bairros,
            total_territorios,
            total_enderecos,
            total_congregacoes,
            congregacoes_presentes
          `)
          .eq("id", cidadeId)
          .maybeSingle(),

        supabase
          .from("bairros")
          .select("id, cidade_id, nome, ativo")
          .eq("cidade_id", cidadeId)
          .order("nome"),
      ]);

    setCarregandoDados(false);

    if (resultadoCidade.error) {
      console.error(resultadoCidade.error);
      alert("Não foi possível carregar a cidade.");
      return;
    }

    if (resultadoBairros.error) {
      console.error(resultadoBairros.error);
      alert("Não foi possível carregar os bairros.");
      return;
    }

    setCidade(
      resultadoCidade.data as CidadeResumo | null
    );

    setBairros(
  (resultadoBairros.data ?? []) as BairroAdmin[]
);
  }

  useEffect(() => {
    if (usuario && isAdmin && Number.isFinite(cidadeId)) {
      carregarDados();
    }
  }, [usuario, isAdmin, cidadeId]);

  function novoBairro() {
  setBairroSelecionado(null);
  setBairroDialogAberto(true);
}

function editarBairro(bairro: BairroAdmin) {
  setBairroSelecionado(bairro);
  setBairroDialogAberto(true);
}

function fecharBairroDialog() {
  setBairroDialogAberto(false);
  setBairroSelecionado(null);
}

  if (carregando) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-4 text-sm text-slate-500">
          Verificando acesso...
        </div>
  
      </main>
    );
  }

  if (!usuario || !isAdmin) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Você não possui permissão para acessar esta página.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 pb-24">
      <div className="mx-auto max-w-3xl">
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
              Cidade
            </p>

            <h1 className="truncate text-2xl font-bold text-slate-900">
              {cidade?.nome ?? "Carregando..."}
            </h1>
          </div>

          <button
            type="button"
            onClick={carregarDados}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
            aria-label="Atualizar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {carregandoDados ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-slate-500">
            Carregando cidade...
          </div>
        ) : !cidade ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Cidade não encontrada.
          </div>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <Building2 className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {cidade.nome}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {cidade.congregacoes_presentes ||
                          "Ainda sem território vinculado"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        cidade.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {cidade.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Resumo
                  icone={MapPinned}
                  numero={cidade.total_bairros}
                  titulo="Bairros"
                />

                <Resumo
                  icone={Map}
                  numero={cidade.total_territorios}
                  titulo="Territórios"
                />

                <Resumo
                  icone={Home}
                  numero={cidade.total_enderecos}
                  titulo="Endereços"
                />
              </div>
            </section>

            <section
              id="bairros"
              className="mt-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Bairros
                  </h2>

                  <p className="text-sm text-slate-500">
                    Bairros cadastrados nesta cidade.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={novoBairro}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Novo
                </button>
              </div>

              {bairros.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Nenhum bairro cadastrado nesta cidade.
                </div>
              ) : (
                <div className="space-y-2">
                  {bairros.map((bairro) => (
                    <button
                      key={bairro.id}
                      type="button"
                      onClick={() => editarBairro(bairro)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-violet-300"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700">
                        <MapPinned className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {bairro.nome}
                        </h3>

                        <p
                          className={`mt-0.5 text-xs font-semibold ${
                            bairro.ativo
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {bairro.ativo ? "Ativo" : "Inativo"}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
      <BairroDialog
  aberto={bairroDialogAberto}
  cidadeId={cidadeId}
  cidadeNome={cidade?.nome ?? ""}
  bairro={bairroSelecionado}
  fechar={fecharBairroDialog}
  aoSalvar={carregarDados}
/>
    </main>
  );
}

function Resumo({
  icone: Icon,
  numero,
  titulo,
}: {
  icone: typeof Map;
  numero: number;
  titulo: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-slate-500" />

      <p className="mt-1 text-lg font-bold text-slate-900">
        {numero}
      </p>

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
    </div>
  );
}