import Link from "next/link";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FiltroTerritorios } from "@/components/territorios/FiltroTerritorios";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function TerritoriosDaCongregacao({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: congregacao } = await supabase
    .from("congregacoes")
    .select("id, nome")
    .eq("id", id)
    .single();

  const { data: territorios, error } = await supabase
    .from("v_territorios_resumo")
    .select(`
      id,
      nome,
      numero,
      congregacao_id,
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
      ativo,
      status_designacao
    `)
    .eq("congregacao_id", id)
    .eq("ativo", true)
    .order("nome");

  if (error) {
    console.error("Erro ao carregar territórios:", error);
  }

  return (
    <main className="min-h-screen bg-[#F4F5F0] pb-28 text-[#17211C] [font-family:var(--font-geist-sans)]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-4 text-white shadow-[0_5px_20px_rgba(11,43,32,0.16)] sm:py-5">
        <div className="mx-auto flex max-w-[760px] items-center gap-3">
          <Link
            href={`/congregacoes/${id}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-[-0.01em] sm:text-lg">
              Territórios
            </h1>
            <p className="mt-0.5 truncate text-xs text-[#BFD0B8] sm:text-sm">
              {congregacao?.nome}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Buscar território"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Atualizar territórios"
              className="grid h-10 w-10 place-items-center rounded-xl text-[#DCE8D5] transition hover:bg-white/10 active:scale-95 active:bg-white/15"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-[760px] px-4 py-5 sm:px-6 sm:py-6">
        {error ? (
          <div className="rounded-[18px] border border-[#B84A4A]/20 bg-[#B84A4A]/8 p-4 text-sm text-[#B84A4A]">
            Não foi possível carregar os territórios.
          </div>
        ) : (
          <FiltroTerritorios territorios={territorios ?? []} />
        )}
      </section>

      <MobileBottomNav congregacaoId={id} variant="green" />
    </main>
  );
}
