import { supabase } from "@/lib/supabase";
import AdminEnderecoArea from "@/components/enderecos/AdminEnderecoArea";
import ListaEnderecosSelecionavel from "@/components/enderecos/ListaEnderecosSelecionavel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";

export default async function Territorio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: territorioResumo, error: erroTerritorio } = await supabase
    .from("v_territorios_resumo")
    .select(`
      id,
      legacy_id,
      congregacao_id,
      nome,
      numero,
      cidade_id,
      cidade_referencia,
      bairro_referencia,
      cidades_presentes,
      bairros_presentes,
      total_cidades,
      total_bairros,
      total_enderecos,
      total_visitados,
      total_nao_visitados,
      total_nao_atendeu,
      total_novos,
      ponto_referencia,
      observacoes,
      ativo,
      status_designacao,
      responsavel_atual,
      data_retirada,
      data_prevista_devolucao,
      observacoes_designacao
    `)
    .eq("id", id)
    .single();

  if (erroTerritorio || !territorioResumo) {
    return (
      <main className="min-h-screen bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Não foi possível carregar este território.
        </div>
      </main>
    );
  }

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("id, nome")
    .eq("id", territorioResumo.congregacao_id)
    .single();

  const { data: enderecos, error: erroEnderecos } = await supabase
    .from("enderecos")
    .select(`
      *,
      cidades (
        id,
        nome
      ),
      bairros (
        id,
        nome
      )
    `)
    .eq("territorio_id", id)
    .order("numero_sequencial", { ascending: true, nullsFirst: false })
    .order("id");

  const lista = enderecos ?? [];

  /*
   * Compatibilidade temporária:
   * alguns componentes ainda esperam territorio.cidade e territorio.bairro.
   * Depois atualizaremos esses componentes e removeremos esta adaptação.
   */
  const territorio = {
    ...territorioResumo,
    cidade:
      territorioResumo.cidade_referencia ||
      territorioResumo.cidades_presentes ||
      "",
    bairro:
      territorioResumo.bairro_referencia ||
      territorioResumo.bairros_presentes ||
      "",
  };

  const total = territorioResumo.total_enderecos ?? 0;
  const visitados = territorioResumo.total_visitados ?? 0;

  const progresso =
    total > 0 ? Math.round((visitados / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href={`/congregacoes/${territorio.congregacao_id}/territorios`}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="flex-1 truncate text-base font-semibold">
            {territorio.nome}
          </h1>

          <Search className="h-5 w-5" />
          <RefreshCw className="h-5 w-5" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-4">
        <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Território
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {territorio.nome}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {territorio.cidades_presentes ||
                  territorio.cidade_referencia ||
                  "Cidade não informada"}
                {" · "}
                {congregacao?.nome}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">
              {total} end.
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  Bairros presentes
                </p>

                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {territorio.bairros_presentes ||
                    territorio.bairro_referencia ||
                    "Nenhum bairro informado"}
                </p>

                {territorio.total_bairros > 1 && (
                  <p className="mt-1 text-xs font-semibold text-violet-700">
                    {territorio.total_bairros} bairros neste território
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <StatusBadge
              status="visitado"
              count={territorio.total_visitados}
            />

            <StatusBadge
              status="nao_visitado"
              count={territorio.total_nao_visitados}
            />

            <StatusBadge
              status="nao_atendeu"
              count={territorio.total_nao_atendeu}
            />

            <StatusBadge
              status="novo"
              count={territorio.total_novos}
            />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>Progresso do território</span>
              <span>{progresso}% visitado</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>

        {erroEnderecos && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar os endereços.
          </div>
        )}

        <AdminEnderecoArea territorio={territorio} />

        <ListaEnderecosSelecionavel
          enderecos={lista}
          territorio={territorio}
          congregacao={congregacao}
        />
      </section>

      <MobileBottomNav congregacaoId={String(territorio.congregacao_id)} />
    </main>
  );
}