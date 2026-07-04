import Link from "next/link";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
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
    .select("*")
    .eq("id", id)
    .single();

  const { data: territorios } = await supabase
    .from("territorios")
    .select(`
      id,
      nome,
      cidade,
      bairro,
      numero,
      enderecos (
        id,
        status
      )
    `)
    .eq("congregacao_id", id)
    .order("bairro")
    .order("numero");

  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href={`/congregacoes/${id}`} className="rounded-full p-2 hover:bg-white/10">
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
        <FiltroTerritorios territorios={territorios ?? []} />
      </section>
      <MobileBottomNav congregacaoId={id} />
    </main>
  );
}