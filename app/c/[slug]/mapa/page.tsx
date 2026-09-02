import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { buscarUnidadePublica } from "@/lib/public-congregation";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MapaFiltros, { type EnderecoMapa } from "@/components/maps/MapaFiltros";

export default async function MapaPublicoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unidade = await buscarUnidadePublica(slug);
  if (!unidade) notFound();

  const { data: enderecos } = await supabase
    .from("enderecos")
    .select(`
      id, rua, numero, bairro_id, cidade_id, bairro, cidade, ativo, status,
      latlong, latitude, longitude, link_google_maps,
      territorios!inner (id, nome, bairro, cidade, congregacao_id)
    `)
    .eq("ativo", true)
    .eq("territorios.congregacao_id", unidade.id);

  const enderecosMapa = (enderecos ?? []).map((endereco) => ({
    ...endereco,
    territorios: Array.isArray(endereco.territorios)
      ? endereco.territorios[0] ?? null
      : endereco.territorios,
  })) as EnderecoMapa[];

  return (
    <main className="min-h-screen bg-[#F4F5F0] pb-24 text-[#17211C]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-3 text-white">
        <div className="mx-auto flex max-w-[820px] items-center gap-3">
          <Link href={`/c/${slug}`} aria-label="Voltar" className="grid h-11 w-11 place-items-center rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold">Mapa</h1>
            <p className="truncate text-xs text-white/70">{unidade.nome}</p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[820px] px-4 py-3 sm:py-4">
        <MapaFiltros enderecos={enderecosMapa} limites={[]} podeVerLimites={false} />
      </section>
      <MobileBottomNav congregacaoId={String(unidade.id)} variant="green" activeItem="mapa" publicSlug={slug} />
    </main>
  );
}
