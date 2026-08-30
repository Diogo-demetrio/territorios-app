import Link from "next/link";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MapaFiltros from "@/components/maps/MapaFiltros";
import type { EnderecoMapa } from "@/components/maps/MapaFiltros";
import type { LimiteCongregacao } from "@/components/maps/types";

export default async function MapaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabaseServidor = await createClient();
  const {
    data: { user },
  } = await supabaseServidor.auth.getUser();

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
      bairro_id,
      cidade_id,
      bairro,
      cidade,
      ativo,
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

  const enderecosMapa = (enderecos ?? []).map((endereco) => ({
    ...endereco,
    territorios: Array.isArray(endereco.territorios)
      ? endereco.territorios[0] ?? null
      : endereco.territorios,
  })) as EnderecoMapa[];

  const { data: limites } = user
    ? await supabaseServidor
        .from("limites_congregacoes")
        .select(`
          id,
          nome,
          numero,
          idioma,
          cor,
          atualizado_origem_em,
          coordenadas
        `)
        .eq("ativo", true)
        .order("idioma")
        .order("nome")
    : { data: [] };

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
        <MapaFiltros
          enderecos={enderecosMapa}
          limites={(limites ?? []) as LimiteCongregacao[]}
          podeVerLimites={Boolean(user)}
        />
      </section>

      <MobileBottomNav congregacaoId={id} />
    </main>
  );
}
