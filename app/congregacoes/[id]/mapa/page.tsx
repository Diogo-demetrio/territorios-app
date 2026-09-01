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
    <main className="min-h-screen bg-[#F4F5F0] pb-24 font-sans text-[#17211C]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-3 text-white shadow-[0_4px_18px_rgba(11,43,32,0.16)]">
        <div className="mx-auto flex max-w-[820px] items-center gap-2 sm:gap-3">
          <Link href={`/congregacoes/${id}`} aria-label="Voltar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10 active:bg-white/15">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold leading-tight sm:text-lg">Mapa</h1>
            <p className="mt-0.5 truncate text-xs text-white/70 sm:text-sm">{congregacao?.nome}</p>
          </div>

          <button aria-label="Buscar endereço" className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 active:bg-white/15"><Search className="h-5 w-5" /></button>
          <button aria-label="Atualizar mapa" className="flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 active:bg-white/15"><RefreshCw className="h-5 w-5" /></button>
        </div>
      </header>

      <section className="mx-auto max-w-[820px] px-4 py-3 sm:py-4">
        <MapaFiltros
          enderecos={enderecosMapa}
          limites={(limites ?? []) as LimiteCongregacao[]}
          podeVerLimites={Boolean(user)}
        />
      </section>

      <MobileBottomNav congregacaoId={id} variant="green" activeItem="mapa" />
    </main>
  );
}
