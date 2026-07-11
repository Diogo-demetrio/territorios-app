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
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href={`/congregacoes/${id}`}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="flex-1 text-base font-semibold">
            Territórios · {congregacao?.nome}
          </h1>

          <Search className="h-5 w-5" />
          <RefreshCw className="h-5 w-5" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar os territórios.
          </div>
        ) : (
          <FiltroTerritorios territorios={territorios ?? []} />
        )}
      </section>

      <MobileBottomNav congregacaoId={id} />
    </main>
  );
}