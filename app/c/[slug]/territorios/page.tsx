import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { buscarUnidadePublica } from "@/lib/public-congregation";
import { FiltroTerritorios } from "@/components/territorios/FiltroTerritorios";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default async function TerritoriosPublicosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unidade = await buscarUnidadePublica(slug);
  if (!unidade) notFound();

  const { data: territorios, error } = await supabase
    .from("v_territorios_resumo")
    .select("*")
    .eq("congregacao_id", unidade.id)
    .eq("ativo", true)
    .order("nome");

  return (
    <main className="min-h-screen bg-[#F4F5F0] pb-28 text-[#17211C]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-4 text-white">
        <div className="mx-auto flex max-w-[760px] items-center gap-3">
          <Link href={`/c/${slug}`} aria-label="Voltar" className="grid h-10 w-10 place-items-center rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-semibold">Territórios</h1>
            <p className="truncate text-xs text-[#BFD0B8]">{unidade.nome}</p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[760px] px-4 py-5 sm:px-6">
        {error ? (
          <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Não foi possível carregar os territórios.
          </div>
        ) : (
          <FiltroTerritorios territorios={territorios ?? []} publicSlug={slug} />
        )}
      </section>
      <MobileBottomNav congregacaoId={String(unidade.id)} variant="green" activeItem="territorios" publicSlug={slug} />
    </main>
  );
}
