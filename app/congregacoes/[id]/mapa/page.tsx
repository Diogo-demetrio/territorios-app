import Link from "next/link";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MapaFiltros from "@/components/maps/MapaFiltros";

export default async function MapaPage({
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

  const { data: enderecos } = await supabase
    .from("enderecos")
    .select(`
      id,
      rua,
      numero,
      bairro,
      cidade,
      status,
      latlong,
      latitude,
      longitude,
      link_google_maps,
      territorios!inner (
  id,
  nome,
  bairro,
  cidade,
  congregacao_id
)
    `)
    .eq("ativo", true)
    .eq("territorios.congregacao_id", id);

  return (
    <main className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 z-20 bg-violet-700 px-4 py-4 text-white shadow">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href={`/congregacoes/${id}`} className="rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <h1 className="flex-1 text-base font-semibold">
            Mapa · {congregacao?.nome}
          </h1>

          <Search className="h-5 w-5" />
          <RefreshCw className="h-5 w-5" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl p-4">
        <MapaFiltros enderecos={enderecos ?? []} />
      </section>

      <MobileBottomNav congregacaoId={id} />
    </main>
  );
}