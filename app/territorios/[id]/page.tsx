import { supabase } from "@/lib/supabase";
import AdminEnderecoArea from "@/components/enderecos/AdminEnderecoArea";
import ListaEnderecosSelecionavel from "@/components/enderecos/ListaEnderecosSelecionavel";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import EnderecosInativos from "@/components/enderecos/EnderecosInativos";
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
      <main className="min-h-screen bg-[#F4F5F0] p-4 [font-family:var(--font-geist-sans)]">
        <div className="mx-auto max-w-[760px] rounded-[18px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
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
    ),
    territorios (
      id,
      nome,
      congregacao_id
    )
  `)
    .eq("territorio_id", id)
.eq("ativo", true)
.order("numero_sequencial", { ascending: true, nullsFirst: false })
    

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
    <main className="min-h-screen bg-[#F4F5F0] pb-28 text-[#17211C] [font-family:var(--font-geist-sans)]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-4 text-white shadow-[0_5px_20px_rgba(11,43,32,0.16)] sm:py-5">
        <div className="mx-auto flex max-w-[760px] items-center gap-3">
          <Link
            href={`/congregacoes/${territorio.congregacao_id}/territorios`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="min-w-0 flex-1 truncate text-base font-semibold tracking-[-0.01em] sm:text-lg">
            {territorio.nome}
          </h1>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Buscar endereço"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Atualizar território"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[760px] px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 rounded-[20px] border border-[#DDE2DB]/90 bg-white p-4 shadow-[0_5px_20px_rgba(18,61,44,0.05)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2F6B4F]">
                Território
              </p>

              <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-[#17211C] sm:text-2xl">
                {territorio.nome}
              </h2>

              <p className="mt-1 text-sm text-[#6F7872]">
                {territorio.cidades_presentes ||
                  territorio.cidade_referencia ||
                  "Cidade não informada"}
                {" · "}
                {congregacao?.nome}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-[#DCE8D5] px-3 py-1.5 text-xs font-semibold text-[#123D2C] sm:text-sm">
              {total} end.
            </span>
          </div>

          <div className="mt-4 rounded-[14px] bg-[#F4F5F0] p-3.5">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2F6B4F]" />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#6F7872]">
                  Bairros presentes
                </p>

                <p className="mt-1 text-sm leading-relaxed text-[#17211C]">
                  {territorio.bairros_presentes ||
                    territorio.bairro_referencia ||
                    "Nenhum bairro informado"}
                </p>

                {territorio.total_bairros > 1 && (
                  <p className="mt-1 text-xs font-semibold text-[#2F6B4F]">
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
            <div className="mb-2 flex items-center justify-between text-xs text-[#6F7872]">
              <span>Progresso do território</span>
              <span className="font-semibold text-[#2F6B4F]">{progresso}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#DCE8D5]/70">
              <div
                className="h-full rounded-full bg-[#2F6B4F] transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        </div>

        {erroEnderecos && (
          <div className="mb-4 rounded-[18px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
            Não foi possível carregar os endereços.
          </div>
        )}

        <AdminEnderecoArea territorio={territorio} />

<EnderecosInativos
  territorioId={Number(territorio.id)}
/>

<ListaEnderecosSelecionavel
          enderecos={lista}
          territorio={territorio}
          congregacao={congregacao}
        />
      </section>

      <MobileBottomNav
        congregacaoId={String(territorio.congregacao_id)}
        variant="green"
        activeItem="territorios"
      />
    </main>
  );
}
