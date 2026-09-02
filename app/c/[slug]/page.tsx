import Link from "next/link";
import { ChevronRight, LockKeyhole, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { buscarUnidadePublica } from "@/lib/public-congregation";
import CongregacaoDashboard from "@/components/cards/CongregacaoDashboard";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

type TerritorioResumo = {
  cidade_id: number | null;
  cidade_referencia: string | null;
  total_enderecos: number | null;
};

export default async function UnidadePublicaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unidade = await buscarUnidadePublica(slug);
  if (!unidade) notFound();

  const { data: territoriosData } = await supabase
    .from("v_territorios_resumo")
    .select("cidade_id, cidade_referencia, total_enderecos")
    .eq("congregacao_id", unidade.id)
    .eq("ativo", true);

  const territorios = (territoriosData ?? []) as TerritorioResumo[];
  const cidades = Array.from(
    territorios.reduce((mapa, territorio) => {
      if (!territorio.cidade_id) return mapa;
      const atual = mapa.get(territorio.cidade_id) ?? {
        id: territorio.cidade_id,
        nome: territorio.cidade_referencia ?? "Cidade não informada",
        totalTerritorios: 0,
        totalEnderecos: 0,
      };
      atual.totalTerritorios += 1;
      atual.totalEnderecos += territorio.total_enderecos ?? 0;
      mapa.set(territorio.cidade_id, atual);
      return mapa;
    }, new Map<number, { id: number; nome: string; totalTerritorios: number; totalEnderecos: number }>()).values()
  ).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const totalEnderecos = territorios.reduce(
    (total, territorio) => total + (territorio.total_enderecos ?? 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#F4F5F0] pb-28 text-[#17211C]">
      <header className="sticky top-0 z-20 bg-[#123D2C] px-4 py-4 text-white shadow-[0_5px_20px_rgba(11,43,32,0.16)]">
        <div className="mx-auto max-w-[820px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#BFD0B8]">
            {unidade.tipo_unidade === "grupo" ? "Grupo" : "Congregação"}
          </p>
          <h1 className="mt-0.5 truncate text-lg font-semibold">{unidade.nome}</h1>
        </div>
      </header>

      <section className="mx-auto max-w-[820px] space-y-5 px-4 py-5 sm:px-6">
        <CongregacaoDashboard
          congregacaoId={unidade.id}
          nome={unidade.nome}
          cidade={`${unidade.cidade_base ?? ""} · ${unidade.idioma ?? ""}`}
          territorios={territorios.length}
          enderecos={totalEnderecos}
          publicadores={0}
          grupos={0}
          publicSlug={slug}
        />

        <div className="rounded-[22px] border border-[#DDE2DB]/90 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold">Cidades</h2>
          <p className="mt-1 text-sm text-[#6F7872]">Selecione uma cidade para visualizar seus territórios.</p>
          <div className="mt-4 space-y-2">
            {cidades.map((cidade) => (
              <Link
                key={cidade.id}
                href={`/cidades/${cidade.id}?congregacao=${unidade.id}&publico=${encodeURIComponent(slug)}`}
                className="group flex items-center gap-3 rounded-[18px] border border-[#DDE2DB] bg-[#FAFBF8] p-3"
              >
                <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#DCE8D5] text-[#123D2C]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{cidade.nome}</h3>
                  <p className="mt-0.5 text-xs text-[#6F7872]">
                    {cidade.totalTerritorios} territórios · {cidade.totalEnderecos} endereços
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#9AA39D]" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex justify-center pb-2 pt-1">
          <Link
            href={`/configuracoes?congregacao=${unidade.id}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-[#6F7872] transition hover:bg-white hover:text-[#123D2C]"
          >
            <LockKeyhole className="h-3.5 w-3.5" />
            Acesso administrativo
          </Link>
        </div>
      </section>

      <MobileBottomNav congregacaoId={String(unidade.id)} variant="green" publicSlug={slug} />
    </main>
  );
}
